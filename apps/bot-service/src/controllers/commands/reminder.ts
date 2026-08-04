import {
  sendWhatsAppMessage,
  sendWhatsAppButtons,
} from '../../infrastructure/gateways/whatsapp.gateway.js';
import {
  getUserSession,
  setPendingAction,
  setUserActiveMode,
} from '../../infrastructure/store/session.store.js';
import {
  apiGetReminders,
  apiCreateReminder,
  apiUpdateReminder,
  apiDeleteReminder,
  resolveAccessToken,
} from '../../infrastructure/gateways/api-client.gateway.js';
import { askGroqAI } from '../../infrastructure/gateways/groq.gateway.js';
import {
  sendRegisterPrompt,
  handleNameRegistration,
} from './auth.shared.js';
import { logger } from '../../utils/logger.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedReminder {
  title: string;
  body?: string;
  remindAt: string; // ISO 8601
  recurrence?: string; // cron expression jika berulang
  confidence: 'high' | 'medium' | 'low';
  clarification?: string;
}

// ─── Formatter Helpers ────────────────────────────────────────────────────────

function formatReminderDate(isoStr: string, timezoneOffset = 7): string {
  const date = new Date(isoStr);
  const local = new Date(date.getTime() + timezoneOffset * 60 * 60 * 1000);
  return local.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
}

// ─── AI Parser ────────────────────────────────────────────────────────────────

async function parseReminderWithAI(
  naturalText: string,
  userTimezoneOffset = 7,
): Promise<ParsedReminder | null> {
  const now = new Date();
  const localNow = new Date(now.getTime() + userTimezoneOffset * 60 * 60 * 1000);
  const nowISO = localNow.toISOString().replace('Z', '+00:00');

  const systemPrompt =
    `Kamu adalah asisten pengingat. Tugasmu adalah mengekstrak informasi reminder dari teks bebas Bahasa Indonesia.\n\n` +
    `Waktu sekarang (UTC+${userTimezoneOffset}): ${nowISO}\n\n` +
    `Ekstrak:\n` +
    `- title: judul singkat reminder (maks 10 kata)\n` +
    `- body: deskripsi tambahan (opsional, bisa null)\n` +
    `- remindAt: waktu pengingat dalam format ISO 8601 UTC. Konversi dari UTC+${userTimezoneOffset}. Misal jam 9 pagi WIB = subtract ${userTimezoneOffset} jam untuk dapat UTC.\n` +
    `- recurrence: cron expression jika berulang (misal "setiap hari" = "0 9 * * *"), atau null jika tidak berulang\n` +
    `- confidence: "high" jika waktu jelas, "medium" jika perlu asumsi kecil, "low" jika ambigu\n` +
    `- clarification: (opsional) pertanyaan klarifikasi jika confidence low\n\n` +
    `Jawab HANYA dengan JSON valid. Format:\n` +
    `{"title":"meeting kantor","body":null,"remindAt":"2025-08-06T01:00:00.000Z","recurrence":null,"confidence":"high"}`;

  try {
    const raw = await askGroqAI(naturalText, systemPrompt);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]) as ParsedReminder;

    if (!parsed.title || !parsed.remindAt) return null;

    // Validasi remindAt di masa depan
    if (new Date(parsed.remindAt) <= new Date()) {
      // Jika waktu sudah lewat, anggap besok
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      parsed.remindAt = parsed.remindAt; // biarkan AI yang handle
    }

    return parsed;
  } catch (err) {
    logger.error({ err }, '❌ [Reminder] AI parsing failed');
    return null;
  }
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

async function sendReminderMenu(from: string, senderName: string): Promise<void> {
  let reminderList = '';

  try {
    const reminders = await apiGetReminders(from, senderName);
    const active = reminders.filter(r => r.isActive);

    if (active.length === 0) {
      reminderList = '\n_Belum ada reminder aktif._\n';
    } else {
      reminderList = '\n*📋 Reminder Aktif:*\n';
      active.slice(0, 5).forEach((r, i) => {
        const shortId = r.id.slice(0, 8);
        reminderList += `├─ ${i + 1}. *${r.title}*\n`;
        reminderList += `│   📅 ${formatReminderDate(r.remindAt)}\n`;
        reminderList += `│   🆔 \`${shortId}\`\n`;
      });
      if (active.length > 5) {
        reminderList += `╰─ _...dan ${active.length - 5} lainnya_\n`;
      } else {
        reminderList = reminderList.replace(/├─ (\d+\.)/, '╰─ $1');
      }
    }
  } catch {
    reminderList = '\n_Gagal memuat reminder._\n';
  }

  const menuText =
    `╭────────────────────────────\n` +
    `│  🔔 *REMINDER MANAGER* 🔔\n` +
    `╰────────────────────────────\n` +
    `${reminderList}\n` +
    `📝 *Perintah:*\n` +
    `├─✦ *.ingatkan <teks>* — buat reminder baru\n` +
    `│   _Contoh: \`.ingatkan besok jam 9 pagi meeting\`_\n` +
    `├─✦ *.edit-ingat <id> <teks>* — edit reminder\n` +
    `╰─✦ *.hapus-ingat <id>* — hapus reminder\n` +
    `\n💡 _Atau ketik bebas, AI akan membantu parse waktunya!_`;

  await sendWhatsAppButtons(
    from,
    menuText,
    [
      { id: '.ingatkan ', title: '➕ Buat Reminder' },
      { id: 'action:exit', title: '🔴 Exit' },
    ],
    '🔔 REMINDER MANAGER',
  );
}

// ─── Confirm Flow Helpers ─────────────────────────────────────────────────────

function buildConfirmText(parsed: ParsedReminder, timezoneOffset = 7): string {
  const confIcon = parsed.confidence === 'high' ? '✅' : parsed.confidence === 'medium' ? '🟡' : '🔴';
  const extraNote = parsed.confidence === 'low' && parsed.clarification
    ? `\n\n⚠️ _${parsed.clarification}_`
    : '';

  return (
    `🤖 *AI mendeteksi reminder ini:*${extraNote}\n\n` +
    `🔔 *${parsed.title}*\n` +
    `├─ Waktu     : *${formatReminderDate(parsed.remindAt, timezoneOffset)}*\n` +
    `├─ Catatan   : ${parsed.body || '-'}\n` +
    `╰─ Berulang  : ${parsed.recurrence ?? 'Tidak'}\n\n` +
    `${confIcon} _Keyakinan AI: ${parsed.confidence}_\n\n` +
    `Konfirmasi atau batalkan reminder ini 👇`
  );
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function handleReminderCommand(
  from: string,
  userText: string,
  senderName: string,
): Promise<boolean> {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();
  const session = getUserSession(from);

  // ── Intercept: Pending register ────────────────────────────────────────────
  if (session.pendingAction === 'awaiting:register:name') {
    return handleNameRegistration(from, trimmed, senderName, async () => {
      setUserActiveMode(from, 'reminder');
      await sendReminderMenu(from, senderName);
    });
  }

  // ── Intercept: Konfirmasi buat reminder ────────────────────────────────────
  if (session.pendingAction?.startsWith('awaiting:reminder:confirm:')) {
    const isConfirm = lower === 'konfirmasi' || lower === 'reminder:confirm';
    const isCancel  = lower === 'batal'       || lower === 'reminder:cancel';

    if (isConfirm) {
      const jsonStr = session.pendingAction.slice('awaiting:reminder:confirm:'.length);
      try {
        const data = JSON.parse(jsonStr) as ParsedReminder;
        setPendingAction(from, null);
        await sendWhatsAppMessage(from, '⏳ Menyimpan reminder...');
        const created = await apiCreateReminder(from, senderName, {
          title: data.title,
          body: data.body,
          remindAt: data.remindAt,
          recurrence: data.recurrence,
        });
        await sendWhatsAppButtons(
          from,
          `✅ *Reminder Disimpan!*\n══════════════════════════════\n🔔 *${created.title}*\n📅 ${formatReminderDate(created.remindAt, session.timezoneOffset ?? 7)}\n🆔 \`${created.id.slice(0, 8)}...\`\n══════════════════════════════\n_Gunakan \`.hapus-ingat ${created.id.slice(0, 8)}\` untuk menghapus._`,
          [
            { id: '.pengingat', title: '📋 Lihat Semua' },
            { id: '.ingatkan ', title: '➕ Tambah Lagi' },
          ],
          '🔔 REMINDER DISIMPAN',
        );
      } catch (err: any) {
        setPendingAction(from, null);
        await sendWhatsAppMessage(from, `❌ Gagal menyimpan: ${err?.response?.data?.message ?? err?.message ?? 'Coba lagi.'}`);
      }
      return true;
    }

    if (isCancel) {
      setPendingAction(from, null);
      await sendWhatsAppMessage(from, '🚫 Reminder dibatalkan.');
      return true;
    }

    // Ingatkan lagi dengan tombol
    const jsonStr = session.pendingAction.slice('awaiting:reminder:confirm:'.length);
    try {
      const data = JSON.parse(jsonStr) as ParsedReminder;
      await sendWhatsAppButtons(
        from,
        `⚠️ Kamu belum mengkonfirmasi reminder:\n\n🔔 *${data.title}*\n📅 ${formatReminderDate(data.remindAt, session.timezoneOffset ?? 7)}\n\nKonfirmasi atau batalkan dulu ya 👇`,
        [
          { id: 'reminder:confirm', title: '✅ Konfirmasi' },
          { id: 'reminder:cancel',  title: '❌ Batal' },
        ],
        '⏳ MENUNGGU KONFIRMASI',
      );
    } catch {
      setPendingAction(from, null);
    }
    return true;
  }

  // ── Intercept: Edit reminder — tunggu input teks baru ──────────────────────
  if (session.pendingAction?.startsWith('awaiting:reminder:edit:')) {
    const reminderId = session.pendingAction.slice('awaiting:reminder:edit:'.length);

    await sendWhatsAppMessage(from, '🤖 _Memproses perubahan dengan AI..._');
    const parsed = await parseReminderWithAI(trimmed, session.timezoneOffset ?? 7);

    if (!parsed) {
      await sendWhatsAppMessage(from, '❌ Tidak bisa memahami perubahan. Coba ketik ulang, contoh:\n_"ganti jadi besok jam 3 sore meeting sales"_');
      return true;
    }

    try {
      setPendingAction(from, null);
      await sendWhatsAppMessage(from, '⏳ Memperbarui reminder...');
      const updated = await apiUpdateReminder(from, senderName, reminderId, {
        title: parsed.title,
        body: parsed.body,
        remindAt: parsed.remindAt,
        recurrence: parsed.recurrence,
      });
      await sendWhatsAppMessage(
        from,
        `✅ *Reminder Diperbarui!*\n══════════════════════════════\n🔔 *${updated.title}*\n📅 ${formatReminderDate(updated.remindAt, session.timezoneOffset ?? 7)}\n══════════════════════════════`,
      );
    } catch (err: any) {
      setPendingAction(from, null);
      await sendWhatsAppMessage(from, `❌ Gagal memperbarui: ${err?.response?.data?.message ?? err?.message ?? 'Coba lagi.'}`);
    }
    return true;
  }

  // ── .pengingat — buka menu ────────────────────────────────────────────────
  if (lower === '.pengingat' || lower === '.reminder') {
    setUserActiveMode(from, 'reminder');
    const token = await resolveAccessToken(from, senderName);
    if (token) {
      await sendReminderMenu(from, senderName);
    } else {
      await sendRegisterPrompt(from);
    }
    return true;
  }

  // ── Button: auth:register (dari register prompt) ─────────────────────────
  // Ditangani di finance.ts juga, tapi bisa masuk sini jika mode reminder
  if (lower === 'auth:register' && session.activeMode === 'reminder') {
    setPendingAction(from, 'awaiting:register:name');
    await sendWhatsAppMessage(
      from,
      `📝 *Daftar Akun JustBot*\n══════════════════════════════\nSilakan ketik *nama panggilan* kamu:\n\n_Nama ini akan digunakan sebagai identitas akun kamu._`,
    );
    return true;
  }

  // ── .ingatkan <teks> — buat reminder baru via AI ─────────────────────────
  if (lower.startsWith('.ingatkan ') || lower === '.ingatkan') {
    const token = await resolveAccessToken(from, senderName);
    if (!token) {
      await sendRegisterPrompt(from);
      return true;
    }

    const parts = trimmed.slice(10).trim();
    if (!parts) {
      await sendWhatsAppMessage(
        from,
        `❌ Tulis deskripsi remindermu setelah .ingatkan\n\n_Contoh: \`.ingatkan besok jam 9 pagi meeting kantor\`_`,
      );
      return true;
    }

    await sendWhatsAppMessage(from, '🤖 _Memproses remindermu dengan AI..._');
    const parsed = await parseReminderWithAI(parts, session.timezoneOffset ?? 7);

    if (!parsed) {
      await sendWhatsAppMessage(
        from,
        `❌ Tidak bisa memahami waktunya.\n\n*Coba lebih spesifik:*\n• \`.ingatkan besok jam 9 pagi meeting\`\n• \`.ingatkan 10 Agustus jam 14.00 ambil paket\`\n• \`.ingatkan setiap hari jam 7 pagi minum obat\``,
      );
      return true;
    }

    setPendingAction(from, `awaiting:reminder:confirm:${JSON.stringify(parsed)}`);
    await sendWhatsAppButtons(
      from,
      buildConfirmText(parsed, session.timezoneOffset ?? 7),
      [
        { id: 'reminder:confirm', title: '✅ Konfirmasi' },
        { id: 'reminder:cancel',  title: '❌ Batal' },
      ],
      '🔔 KONFIRMASI REMINDER',
    );
    return true;
  }

  // ── .edit-ingat <id> — masuk mode edit ───────────────────────────────────
  if (lower.startsWith('.edit-ingat ')) {
    const token = await resolveAccessToken(from, senderName);
    if (!token) {
      await sendRegisterPrompt(from);
      return true;
    }

    const idPrefix = trimmed.slice(12).trim();
    if (!idPrefix) {
      await sendWhatsAppMessage(from, `❌ Masukkan ID reminder yang ingin diedit.\n_Contoh: \`.edit-ingat a1b2c3d4\`_`);
      return true;
    }

    // Cari reminder berdasarkan prefix ID
    try {
      const reminders = await apiGetReminders(from, senderName);
      const match = reminders.find(r => r.id.startsWith(idPrefix));
      if (!match) {
        await sendWhatsAppMessage(from, `❌ Reminder dengan ID \`${idPrefix}\` tidak ditemukan. Gunakan *.pengingat* untuk melihat daftar.`);
        return true;
      }

      setPendingAction(from, `awaiting:reminder:edit:${match.id}`);
      await sendWhatsAppMessage(
        from,
        `✏️ *Edit Reminder*\n══════════════════════════════\n🔔 *${match.title}*\n📅 ${formatReminderDate(match.remindAt, session.timezoneOffset ?? 7)}\n══════════════════════════════\nKetik detail baru reminder ini (waktu, judul, dll):\n\n_Contoh: "ganti jadi besok jam 3 sore review mingguan"_`,
      );
    } catch (err: any) {
      await sendWhatsAppMessage(from, `❌ Gagal mengambil data: ${err?.message ?? 'Coba lagi.'}`);
    }
    return true;
  }

  // ── .hapus-ingat <id> — hapus reminder ───────────────────────────────────
  if (lower.startsWith('.hapus-ingat ')) {
    const token = await resolveAccessToken(from, senderName);
    if (!token) {
      await sendRegisterPrompt(from);
      return true;
    }

    const idPrefix = trimmed.slice(13).trim();
    if (!idPrefix) {
      await sendWhatsAppMessage(from, `❌ Masukkan ID reminder yang ingin dihapus.\n_Contoh: \`.hapus-ingat a1b2c3d4\`_`);
      return true;
    }

    try {
      const reminders = await apiGetReminders(from, senderName);
      const match = reminders.find(r => r.id.startsWith(idPrefix));
      if (!match) {
        await sendWhatsAppMessage(from, `❌ Reminder dengan ID \`${idPrefix}\` tidak ditemukan.`);
        return true;
      }

      await sendWhatsAppMessage(from, `⏳ Menghapus reminder *${match.title}*...`);
      await apiDeleteReminder(from, senderName, match.id);
      await sendWhatsAppButtons(
        from,
        `🗑️ *Reminder Dihapus!*\n══════════════════════════════\n🔔 ~~${match.title}~~\n══════════════════════════════`,
        [{ id: '.pengingat', title: '📋 Lihat Semua' }],
        '🗑️ REMINDER DIHAPUS',
      );
    } catch (err: any) {
      await sendWhatsAppMessage(from, `❌ Gagal menghapus: ${err?.response?.data?.message ?? err?.message ?? 'Coba lagi.'}`);
    }
    return true;
  }

  return false;
}
