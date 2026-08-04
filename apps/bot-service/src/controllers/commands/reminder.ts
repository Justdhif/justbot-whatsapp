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
  Reminder,
} from '../../infrastructure/gateways/api-client.gateway.js';
import { askGroqAI } from '../../infrastructure/gateways/groq.gateway.js';
import {
  sendRegisterPrompt,
  handleNameRegistration,
} from './auth.shared.js';
import { logger } from '../../utils/logger.js';

interface ParsedReminder {
  title: string;
  body?: string;
  remindAt: string; 
  recurrence?: string; 
  confidence: 'high' | 'medium' | 'low';
  clarification?: string;
}

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

    if (new Date(parsed.remindAt) <= new Date()) {
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      parsed.remindAt = parsed.remindAt; 
    }

    return parsed;
  } catch (err) {
    logger.error({ err }, '❌ [Reminder] AI parsing failed');
    return null;
  }
}

interface ParsedReminderEditIntent {
  action: 'edit' | 'delete';
  idPrefix?: string;
  keywords?: string[];
  newTitle?: string;
  newBody?: string;
  newRemindAt?: string; 
  newRecurrence?: string;
  confidence: 'high' | 'medium' | 'low';
  clarification?: string;
}

async function parseReminderEditDeleteIntent(
  naturalText: string,
  recentReminders: Reminder[],
  userTimezoneOffset = 7,
): Promise<ParsedReminderEditIntent | null> {
  const now = new Date();
  const localNow = new Date(now.getTime() + userTimezoneOffset * 60 * 60 * 1000);
  const nowISO = localNow.toISOString().replace('Z', '+00:00');

  const listStr = recentReminders.slice(0, 10).map((r, i) =>
    `${i + 1}. ID:${r.id.slice(0, 8)} | ${r.title} | ${r.remindAt} | Aktif:${r.isActive}`
  ).join('\n');

  const systemPrompt =
    `Kamu adalah asisten pengingat. Deteksi niat edit atau hapus reminder dari teks bebas Bahasa Indonesia.\n\n` +
    `Waktu sekarang (UTC+${userTimezoneOffset}): ${nowISO}\n\n` +
    `Daftar reminder aktif user:\n${listStr}\n\n` +
    `Tentukan:\n` +
    `- action: "edit" atau "delete"\n` +
    `- idPrefix: 8 karakter pertama ID reminder jika user menyebutkannya (atau null)\n` +
    `- keywords: array kata kunci untuk mencocokkan reminder (atau null)\n` +
    `- newTitle: judul baru jika diubah (atau null)\n` +
    `- newBody: catatan baru jika diubah (atau null)\n` +
    `- newRemindAt: waktu pengingat baru dalam format ISO 8601 UTC (atau null)\n` +
    `- newRecurrence: cron expression baru jika berulang (atau null)\n` +
    `- confidence: "high"/"medium"/"low"\n` +
    `- clarification: pertanyaan jika confidence low\n\n` +
    `Jawab HANYA dengan JSON valid. Format:\n` +
    `{"action":"edit","idPrefix":null,"keywords":["meeting"],"newTitle":"meeting koordinasi","newBody":null,"newRemindAt":"2025-08-06T03:00:00.000Z","newRecurrence":null,"confidence":"high"}`;

  try {
    const raw = await askGroqAI(naturalText, systemPrompt);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as ParsedReminderEditIntent;
    if (!parsed.action || !['edit', 'delete'].includes(parsed.action)) return null;
    return parsed;
  } catch (err) {
    logger.error({ err }, '❌ [Reminder] Edit/delete AI parsing failed');
    return null;
  }
}

function matchReminder(reminders: Reminder[], intent: ParsedReminderEditIntent): Reminder | null {
  if (intent.idPrefix) {
    return reminders.find(r => r.id.startsWith(intent.idPrefix!)) ?? null;
  }
  if (intent.keywords && intent.keywords.length > 0) {
    const kws = intent.keywords.map(k => k.toLowerCase());
    const matches = reminders.filter(r => {
      const haystack = `${r.title} ${r.body ?? ''}`.toLowerCase();
      return kws.some(k => haystack.includes(k));
    });
    return matches.length === 1 ? matches[0] : null;
  }
  return null;
}

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

export async function handleReminderCommand(
  from: string,
  userText: string,
  senderName: string,
): Promise<boolean> {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();
  const session = getUserSession(from);
  if (session.pendingAction?.startsWith('awaiting:reminder:edit:confirm:')) {
    const isConfirm = lower === 'konfirmasi' || lower === 'reminder:edit:confirm';
    const isCancel  = lower === 'batal'       || lower === 'reminder:edit:cancel';

    if (isConfirm) {
      const jsonStr = session.pendingAction.slice('awaiting:reminder:edit:confirm:'.length);
      try {
        const data = JSON.parse(jsonStr) as { reminderId: string; changes: Record<string, unknown> };
        setPendingAction(from, null);
        await sendWhatsAppMessage(from, '⏳ Memperbarui reminder...');
        const updated = await apiUpdateReminder(from, senderName, data.reminderId, data.changes as any);
        await sendWhatsAppButtons(
          from,
          `✅ *Reminder Diperbarui!*\n══════════════════════════════\n🔔 *${updated.title}*\n📅 ${formatReminderDate(updated.remindAt, session.timezoneOffset ?? 7)}\n══════════════════════════════`,
          [{ id: '.pengingat', title: '📋 Lihat Semua' }],
          '🔔 REMINDER DIPERBARUI',
        );
      } catch (err: any) {
        setPendingAction(from, null);
        await sendWhatsAppMessage(from, `❌ Gagal memperbarui: ${err?.response?.data?.message ?? err?.message ?? 'Coba lagi.'}`);
      }
      return true;
    }

    if (isCancel) {
      setPendingAction(from, null);
      await sendWhatsAppMessage(from, '🚫 Edit dibatalkan.');
      return true;
    }

    const jsonStr2 = session.pendingAction.slice('awaiting:reminder:edit:confirm:'.length);
    try {
      const data2 = JSON.parse(jsonStr2);
      await sendWhatsAppButtons(
        from,
        `⚠️ Konfirmasi atau batalkan perubahan reminder \`${String(data2.reminderId).slice(0, 8)}\` dulu ya 👇`,
        [{ id: 'reminder:edit:confirm', title: '✅ Konfirmasi' }, { id: 'reminder:edit:cancel', title: '❌ Batal' }],
        '⏳ MENUNGGU KONFIRMASI',
      );
    } catch { setPendingAction(from, null); }
    return true;
  }

  if (session.pendingAction?.startsWith('awaiting:reminder:delete:confirm:')) {
    const isConfirm = lower === 'konfirmasi' || lower === 'reminder:delete:confirm';
    const isCancel  = lower === 'batal'       || lower === 'reminder:delete:cancel';

    if (isConfirm) {
      const jsonStr = session.pendingAction.slice('awaiting:reminder:delete:confirm:'.length);
      try {
        const data = JSON.parse(jsonStr) as { reminderId: string; label: string };
        setPendingAction(from, null);
        await sendWhatsAppMessage(from, '⏳ Menghapus reminder...');
        await apiDeleteReminder(from, senderName, data.reminderId);
        await sendWhatsAppButtons(
          from,
          `🗑️ *Reminder Dihapus!*\n══════════════════════════════\n~~${data.label}~~\n══════════════════════════════`,
          [{ id: '.pengingat', title: '📋 Lihat Semua' }],
          '🗑️ REMINDER DIHAPUS',
        );
      } catch (err: any) {
        setPendingAction(from, null);
        await sendWhatsAppMessage(from, `❌ Gagal menghapus: ${err?.response?.data?.message ?? err?.message ?? 'Coba lagi.'}`);
      }
      return true;
    }

    if (isCancel) {
      setPendingAction(from, null);
      await sendWhatsAppMessage(from, '🚫 Penghapusan dibatalkan.');
      return true;
    }

    const jsonStr3 = session.pendingAction.slice('awaiting:reminder:delete:confirm:'.length);
    try {
      const data3 = JSON.parse(jsonStr3);
      await sendWhatsAppButtons(
        from,
        `⚠️ Konfirmasi atau batalkan penghapusan reminder \`${String(data3.reminderId).slice(0, 8)}\` dulu ya 👇`,
        [{ id: 'reminder:delete:confirm', title: '🗑️ Ya, Hapus' }, { id: 'reminder:delete:cancel', title: '❌ Batal' }],
        '⏳ MENUNGGU KONFIRMASI',
      );
    } catch { setPendingAction(from, null); }
    return true;
  }

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

  if (lower === 'auth:register' && session.activeMode === 'reminder') {
    setPendingAction(from, 'awaiting:register:name');
    await sendWhatsAppMessage(
      from,
      `📝 *Daftar Akun JustBot*\n══════════════════════════════\nSilakan ketik *nama panggilan* kamu:\n\n_Nama ini akan digunakan sebagai identitas akun kamu._`,
    );
    return true;
  }

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

  if (lower.startsWith('.edit ')) {
    const token = await resolveAccessToken(from, senderName);
    if (!token) {
      await sendRegisterPrompt(from);
      return true;
    }

    const editText = trimmed.slice(6).trim();
    if (!editText) {
      await sendWhatsAppMessage(from, '❌ Jelaskan pengingat mana yang ingin diedit.\n_Contoh: `.edit reminder meeting besok jadi jam 10`_');
      return true;
    }

    await sendWhatsAppMessage(from, '🤖 _Mencari pengingat yang dimaksud..._');
    try {
      const reminders = await apiGetReminders(from, senderName);
      const active = reminders.filter(r => r.isActive);
      const intent = await parseReminderEditDeleteIntent(editText, active, session.timezoneOffset ?? 7);

      if (!intent || intent.action !== 'edit') {
        await sendWhatsAppMessage(from, '❌ Tidak bisa memahami pengingat mana yang ingin diedit.\n\nCoba sebutkan kata kunci pengingat:\n_Contoh: `.edit reminder meeting jadi jam 10 pagi`_');
        return true;
      }

      const target = matchReminder(active, intent);
      if (!target) {
        await sendWhatsAppMessage(from, `❌ Tidak bisa menemukan pengingat yang cocok.${intent.clarification ? `\n\n⚠️ ${intent.clarification}` : ''}\n\nGunakan *.pengingat* untuk melihat daftar ID.`);
        return true;
      }

      const changes: Record<string, unknown> = {};
      if (intent.newTitle) changes.title = intent.newTitle;
      if (intent.newBody !== undefined) changes.body = intent.newBody;
      if (intent.newRemindAt) changes.remindAt = intent.newRemindAt;
      if (intent.newRecurrence !== undefined) changes.recurrence = intent.newRecurrence;

      if (Object.keys(changes).length === 0) {
        await sendWhatsAppMessage(from, '❌ Tidak ada perubahan yang terdeteksi. Sebutkan apa yang ingin diubah (waktu, judul, dll).');
        return true;
      }

      const changeLines = [
        intent.newTitle ? `├─ Judul   : ${target.title} → *${intent.newTitle}*` : null,
        intent.newRemindAt ? `├─ Waktu   : ${formatReminderDate(target.remindAt, session.timezoneOffset ?? 7)} → *${formatReminderDate(intent.newRemindAt, session.timezoneOffset ?? 7)}*` : null,
        intent.newBody !== undefined ? `├─ Catatan : ${target.body || '-'} → *${intent.newBody || '-'}*` : null,
        intent.newRecurrence !== undefined ? `├─ Berulang: ${target.recurrence || 'Tidak'} → *${intent.newRecurrence || 'Tidak'}*` : null,
      ].filter(Boolean).join('\n');

      const editConfirmText =
        `✏️ *Konfirmasi Perubahan Reminder*\n══════════════════════════════\n` +
        `🔔 *${target.title}*\n` +
        `🆔 \`${target.id.slice(0, 8)}\`\n\n` +
        `*Perubahan:*\n${changeLines}\n\nKonfirmasi atau batalkan 👇`;

      setPendingAction(from, `awaiting:reminder:edit:confirm:${JSON.stringify({ reminderId: target.id, changes })}`);
      await sendWhatsAppButtons(
        from,
        editConfirmText,
        [{ id: 'reminder:edit:confirm', title: '✅ Konfirmasi' }, { id: 'reminder:edit:cancel', title: '❌ Batal' }],
        '✏️ KONFIRMASI EDIT REMINDER',
      );
    } catch (err: any) {
      await sendWhatsAppMessage(from, `❌ Gagal memproses edit: ${err?.message ?? 'Coba lagi.'}`);
    }
    return true;
  }

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

    try {
      const reminders = await apiGetReminders(from, senderName);
      const match = reminders.find(r => r.id.startsWith(idPrefix));
      if (!match) {
        await sendWhatsAppMessage(from, `❌ Reminder dengan ID \`${idPrefix}\` tidak ditemukan.`);
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

  if (lower.startsWith('.hapus ')) {
    const token = await resolveAccessToken(from, senderName);
    if (!token) {
      await sendRegisterPrompt(from);
      return true;
    }

    const hapusText = trimmed.slice(7).trim();
    if (!hapusText) {
      await sendWhatsAppMessage(from, '❌ Sebutkan ID atau deskripsi pengingat yang ingin dihapus.');
      return true;
    }

    await sendWhatsAppMessage(from, '🤖 _Mencari pengingat yang dimaksud..._');
    try {
      const reminders = await apiGetReminders(from, senderName);
      const active = reminders.filter(r => r.isActive);

      let target = active.find(r => r.id.startsWith(hapusText)) ?? null;
      if (!target) {
        const intent = await parseReminderEditDeleteIntent(hapusText, active, session.timezoneOffset ?? 7);
        if (intent) target = matchReminder(active, intent);
      }

      if (!target) {
        await sendWhatsAppMessage(from, '❌ Tidak bisa menemukan pengingat yang cocok.\n\nGunakan *.pengingat* untuk melihat daftar.');
        return true;
      }

      const label = target.title;
      setPendingAction(from, `awaiting:reminder:delete:confirm:${JSON.stringify({ reminderId: target.id, label })}`);
      await sendWhatsAppButtons(
        from,
        `🗑️ *Hapus Reminder?*\n══════════════════════════════\n🔔 *${target.title}*\n📅 ${formatReminderDate(target.remindAt, session.timezoneOffset ?? 7)}\n🆔 \`${target.id.slice(0, 8)}\`\n══════════════════════════════\nReminder ini akan dihapus permanen 👇`,
        [{ id: 'reminder:delete:confirm', title: '🗑️ Ya, Hapus' }, { id: 'reminder:delete:cancel', title: '❌ Batal' }],
        '🗑️ KONFIRMASI HAPUS REMINDER',
      );
    } catch (err: any) {
      await sendWhatsAppMessage(from, `❌ Gagal memproses hapus: ${err?.message ?? 'Coba lagi.'}`);
    }
    return true;
  }

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
