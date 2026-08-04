import {
  sendWhatsAppMessage,
  sendWhatsAppButtons,
} from '../../infrastructure/gateways/whatsapp.gateway.js';
import {
  getUserSession,
  setUserActiveMode,
  setPendingAction,
} from '../../infrastructure/store/session.store.js';
import {
  resolveAccessToken,
  registerUserWithName,
  apiGetTransactions,
  apiCreateTransaction,
  apiDeleteTransaction,
  apiGetFinanceSummary,
} from '../../infrastructure/gateways/api-client.gateway.js';
import { askGroqAI } from '../../infrastructure/gateways/groq.gateway.js';
import { logger } from '../../utils/logger.js';

// ─── AI Transaction Parser ────────────────────────────────────────────────────

interface ParsedTransaction {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  clarification?: string; // pesan jika AI tidak yakin
}

/**
 * Gunakan Groq AI untuk mengekstrak data transaksi dari teks bebas.
 * Return null jika AI tidak bisa memparse dengan confidence cukup.
 */
async function parseTransactionWithAI(
  naturalText: string,
): Promise<ParsedTransaction | null> {
  const systemPrompt = `Kamu adalah asisten pencatat keuangan. Tugasmu adalah mengekstrak informasi transaksi keuangan dari teks bebas Bahasa Indonesia.

Ekstrak informasi berikut:
- type: "income" jika pemasukan/terima/dapat uang, "expense" jika pengeluaran/beli/bayar/habis uang
- amount: jumlah uang dalam angka bulat (tanpa simbol atau titik/koma)
- category: kategori singkat 1-2 kata (contoh: "makan", "transport", "belanja", "gaji", "hiburan", "kesehatan", "tagihan", "investasi", dll)
- description: deskripsi singkat transaksi (maksimal 10 kata)
- confidence: "high" jika jelas, "medium" jika perlu asumsi kecil, "low" jika banyak asumsi
- clarification: (opsional) jika confidence low, berikan pertanyaan klarifikasi singkat

Jawab HANYA dengan JSON valid, tanpa markdown, tanpa komentar. Format:
{"type":"expense","amount":20000,"category":"makan","description":"nasi goreng 2 porsi","confidence":"high"}`;

  try {
    const raw = await askGroqAI(naturalText, systemPrompt);
    // Ambil hanya bagian JSON dari response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as ParsedTransaction;

    // Validasi field wajib
    if (
      !parsed.type ||
      !['income', 'expense'].includes(parsed.type) ||
      !parsed.amount ||
      typeof parsed.amount !== 'number' ||
      parsed.amount <= 0 ||
      !parsed.category
    ) {
      return null;
    }

    return parsed;
  } catch (err) {
    logger.error({ err }, '❌ [Finance] AI parsing failed');
    return null;
  }
}

// ─── Formatter Helpers ────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

/**
 * Tampilkan menu Finance Manager lengkap setelah user terautentikasi.
 */
async function sendFinanceMenu(from: string, displayName?: string): Promise<void> {
  const greet = displayName ? ` ${displayName}` : '';
  const menuText = `╭────────────────────────────
│  💰 *FINANCE MANAGER* 💰
╰────────────────────────────
Halo${greet}! Mode keuangan aktif. ✅

📝 *Perintah yang tersedia:*

├─✦ *.catat masuk <jumlah> <kategori>* [deskripsi]
│   _Contoh: \`.catat masuk 500000 gaji "gaji agustus"\`_
│
├─✦ *.catat keluar <jumlah> <kategori>* [deskripsi]
│   _Contoh: \`.catat keluar 35000 makan "makan siang"\`_
│
├─✦ *.riwayat* — 10 transaksi terakhir
├─✦ *.riwayat masuk* / *.riwayat keluar* — filter tipe
├─✦ *.laporan* — ringkasan total keuangan
├─✦ *.hapus <id>* — hapus transaksi berdasarkan ID
╰────────────────────────────
💡 _Atau chat bebas untuk konsultasi keuangan dengan AI._`;

  const buttons = [
    { id: '.laporan', title: '📊 Laporan' },
    { id: '.riwayat', title: '📋 Riwayat' },
    { id: 'action:exit', title: '🔴 Exit' },
  ];
  await sendWhatsAppButtons(from, menuText, buttons, '💰 FINANCE MANAGER');
}

/**
 * Tampilkan pesan sambutan untuk user yang belum punya akun,
 * dengan tombol "Mulai Daftar".
 */
async function sendRegisterPrompt(from: string): Promise<void> {
  const welcomeText = `╭────────────────────────────
│  💰 *FINANCE MANAGER* 💰
╰────────────────────────────
Halo! Kamu belum memiliki akun Finance Manager.

Dengan mendaftar, kamu bisa:
├─✦ Mencatat pemasukan & pengeluaran
├─✦ Melihat riwayat transaksi
├─✦ Mendapat laporan keuangan otomatis
╰────────────────────────────
Tap tombol di bawah untuk mulai daftar! 👇`;

  const buttons = [
    { id: 'finance:register', title: '📝 Daftar Sekarang' },
  ];
  await sendWhatsAppButtons(from, welcomeText, buttons, '💰 SELAMAT DATANG');
}

// ─── Main Finance Command Handler ─────────────────────────────────────────────

/**
 * Menangani semua perintah finance.
 * Return true jika perintah ditangani, false jika tidak relevan.
 */
export async function handleFinanceCommand(
  from: string,
  userText: string,
  senderName: string,
): Promise<boolean> {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();
  const session = getUserSession(from);

  // ── Intercept: Pending Action (multi-step conversation) ───────────────────
  if (session.pendingAction === 'awaiting:register:name') {
    return handleNameInput(from, trimmed, senderName);
  }

  // Intercept konfirmasi transaksi AI
  if (session.pendingAction?.startsWith('awaiting:catat:confirm:')) {
    const isConfirm = lower === 'konfirmasi' || lower === 'catat:confirm';
    const isCancel  = lower === 'batal'       || lower === 'catat:cancel';

    if (isConfirm) {
      const jsonStr = session.pendingAction.slice('awaiting:catat:confirm:'.length);
      try {
        const data = JSON.parse(jsonStr);
        setPendingAction(from, null);
        await sendWhatsAppMessage(from, '⏳ Menyimpan transaksi...');
        return saveCatatTransaction(from, senderName, data.type, data.amount, data.category, data.description);
      } catch {
        setPendingAction(from, null);
        await sendWhatsAppMessage(from, '❌ Data konfirmasi rusak. Silakan ulangi perintah .catat.');
        return true;
      }
    }

    if (isCancel) {
      setPendingAction(from, null);
      await sendWhatsAppMessage(from, '🚫 Transaksi dibatalkan.');
      return true;
    }

    // User kirim hal lain saat menunggu konfirmasi → ingatkan lagi dengan tombol
    const jsonStr = session.pendingAction.slice('awaiting:catat:confirm:'.length);
    try {
      const data = JSON.parse(jsonStr);
      const icon  = data.type === 'income' ? '📈' : '📉';
      const label = data.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
      await sendWhatsAppButtons(
        from,
        `⚠️ Kamu belum mengkonfirmasi transaksi sebelumnya:\n\n${icon} *${label}* ${formatRupiah(data.amount)} • ${data.category}\n\nKonfirmasi atau batalkan dulu ya 👇`,
        [
          { id: 'catat:confirm', title: '✅ Konfirmasi' },
          { id: 'catat:cancel',  title: '❌ Batal' },
        ],
        '⏳ MENUNGGU KONFIRMASI',
      );
    } catch {
      setPendingAction(from, null);
    }
    return true;
  }

  // ── .finance / .keuangan ─────────────────────────────────────────────────
  if (lower === '.finance' || lower === '.keuangan') {
    setUserActiveMode(from, 'finance');

    // Cek apakah sudah ada token di session (sudah pernah login sebelumnya)
    const token = await resolveAccessToken(from, senderName);

    if (token) {
      // Sudah terautentikasi → tampilkan menu langsung
      await sendFinanceMenu(from, senderName);
    } else {
      // Belum punya akun → tampilkan prompt daftar
      await sendRegisterPrompt(from);
    }
    return true;
  }

  // ── Button: finance:register ──────────────────────────────────────────────
  if (lower === 'finance:register') {
    setPendingAction(from, 'awaiting:register:name');
    await sendWhatsAppMessage(
      from,
      `📝 *Langkah 1 dari 1*\n══════════════════════════════\nSilakan ketik *nama panggilan* kamu:\n\n_Nama ini akan digunakan sebagai identitas akun Finance Manager kamu._`,
    );
    return true;
  }

  // ── Finance commands — hanya jika sudah terautentikasi ───────────────────
  const isFinanceCommand =
    lower.startsWith('.catat ') ||
    lower === '.riwayat' ||
    lower === '.riwayat masuk' ||
    lower === '.riwayat keluar' ||
    lower === '.laporan' ||
    lower === '.summary' ||
    lower.startsWith('.hapus ');

  if (isFinanceCommand) {
    // Validasi auth sebelum aksi apapun
    const token = await resolveAccessToken(from, senderName);
    if (!token) {
      await sendWhatsAppMessage(
        from,
        `🔒 Kamu belum punya akun Finance Manager.\nKetik *.finance* untuk mulai mendaftar.`,
      );
      return true;
    }

    return handleAuthenticatedCommand(from, lower, trimmed, senderName);
  }

  return false;
}

// ─── Multi-Step: Handle Name Input ───────────────────────────────────────────

async function handleNameInput(
  from: string,
  nameInput: string,
  senderName: string,
): Promise<boolean> {
  const displayName = nameInput.trim();

  // Validasi nama
  if (!displayName || displayName.length < 2 || displayName.length > 50) {
    await sendWhatsAppMessage(
      from,
      `❌ Nama tidak valid. Masukkan nama panggilan yang terdiri dari 2-50 karakter.\n\nContoh: \`Nadhif\` atau \`Budi Santoso\``,
    );
    return true;
  }

  // Karakter yang tidak boleh ada di nama
  if (/[<>{}[\]\\|^~`]/.test(displayName)) {
    await sendWhatsAppMessage(from, `❌ Nama mengandung karakter yang tidak diperbolehkan. Coba lagi.`);
    return true;
  }

  await sendWhatsAppMessage(from, `⏳ Mendaftarkan akun atas nama *${displayName}*...`);

  try {
    const registered = await registerUserWithName(from, displayName);
    if (!registered) {
      await sendWhatsAppMessage(
        from,
        `❌ Gagal mendaftarkan akun. Coba lagi beberapa saat.\n\nKetik *.finance* untuk mencoba ulang.`,
      );
      setPendingAction(from, null);
      return true;
    }

    // Login setelah register
    const { resolveAccessToken: resolve } = await import('../../infrastructure/gateways/api-client.gateway.js');
    const token = await resolve(from, displayName);

    if (!token) {
      await sendWhatsAppMessage(
        from,
        `⚠️ Akun berhasil dibuat, tapi gagal login otomatis. Ketik *.finance* untuk masuk.`,
      );
      setPendingAction(from, null);
      return true;
    }

    // Selesai! Clear pending action dan tampilkan menu
    setPendingAction(from, null);
    setUserActiveMode(from, 'finance');

    const successText = `✅ *Akun Berhasil Dibuat!*
══════════════════════════════
👤 Nama   : *${displayName}*
📱 Nomor  : +${from}
══════════════════════════════
Selamat datang di Finance Manager! 🎉
Mulai catat keuangan kamu sekarang.`;

    const buttons = [
      { id: '.laporan', title: '📊 Laporan' },
      { id: '.riwayat', title: '📋 Riwayat' },
      { id: 'action:exit', title: '🔴 Exit' },
    ];
    await sendWhatsAppButtons(from, successText, buttons, '💰 FINANCE MANAGER');

    logger.info({ from, displayName }, '✅ [Finance] New user registered via WA');
  } catch (err: any) {
    logger.error({ err, from }, '❌ [Finance] Registration error');
    await sendWhatsAppMessage(
      from,
      `❌ Terjadi kesalahan: ${err?.message ?? 'Coba lagi.'}\n\nKetik *.finance* untuk mencoba ulang.`,
    );
    setPendingAction(from, null);
  }

  return true;
}

// ─── Reusable Save Helper ─────────────────────────────────────────────────────

async function saveCatatTransaction(
  from: string,
  senderName: string,
  type: 'income' | 'expense',
  amount: number,
  category: string,
  description?: string,
): Promise<boolean> {
  try {
    const tx = await apiCreateTransaction(from, senderName, {
      type, amount, category, description,
      date: new Date().toISOString().split('T')[0],
    });

    const icon = type === 'income' ? '📈' : '📉';
    const label = type === 'income' ? 'PEMASUKAN' : 'PENGELUARAN';
    const replyText = `✅ *Transaksi Dicatat!*
══════════════════════════════
${icon} *${label}*
💰 Jumlah    : ${formatRupiah(amount)}
🏷️ Kategori : ${category}${description ? `\n📝 Deskripsi: ${description}` : ''}
📅 Tanggal  : ${formatDate(tx.date ?? new Date().toISOString())}
🆔 ID       : \`${tx.id.slice(0, 8)}...\`
══════════════════════════════
_Gunakan \`.hapus ${tx.id.slice(0, 8)}\` untuk membatalkan transaksi ini._`;

    await sendWhatsAppButtons(from, replyText,
      [{ id: '.riwayat', title: '📋 Lihat Riwayat' }, { id: '.laporan', title: '📊 Laporan' }],
      `${icon} TRANSAKSI DICATAT`);
  } catch (err: any) {
    await sendWhatsAppMessage(from, `❌ Gagal menyimpan: ${err?.response?.data?.message ?? err?.message ?? 'Coba lagi.'}`);
  }
  return true;
}

// ─── Authenticated Commands ───────────────────────────────────────────────────

async function handleAuthenticatedCommand(
  from: string,
  lower: string,
  trimmed: string,
  senderName: string,
): Promise<boolean> {

  // ── .catat ──────────────────────────────────────────────────────────────
  if (lower.startsWith('.catat ')) {
    const parts = trimmed.slice(7).trim();

    // ── Fast Path: Format strict masuk/keluar ─────────────────────────────
    const strictMatch = parts.match(
      /^(masuk|keluar)\s+(\d[\d.,]*)\s+(\S+)(?:\s+"([^"]*)")?(?:\s+(.*))?/i,
    );

    if (strictMatch) {
      const type = strictMatch[1].toLowerCase() === 'masuk' ? 'income' : 'expense';
      const amount = parseInt(strictMatch[2].replace(/[.,]/g, ''), 10);
      const category = strictMatch[3];
      const description = strictMatch[4] ?? strictMatch[5] ?? undefined;

      if (isNaN(amount) || amount <= 0) {
        await sendWhatsAppMessage(from, '❌ Jumlah tidak valid. Masukkan angka yang benar.');
        return true;
      }

      await sendWhatsAppMessage(from, '⏳ Menyimpan transaksi...');
      return saveCatatTransaction(from, senderName, type, amount, category, description);
    }

    // ── Smart Path: AI Natural Language Parsing ───────────────────────────
    await sendWhatsAppMessage(from, '🤖 _Memproses catatanmu dengan AI..._');

    const parsed = await parseTransactionWithAI(parts);

    if (!parsed) {
      await sendWhatsAppMessage(
        from,
        `❌ Maaf, saya tidak bisa memahami catatanmu.\n\n*Coba format yang lebih jelas:*\n• \`.catat keluar 20000 makan "nasi goreng 2 porsi"\`\n• \`.catat masuk 500000 gaji\`\n\nAtau deskripsikan ulang dengan menyebutkan *jumlah uang* yang lebih jelas.`,
      );
      return true;
    }

    const { type, amount, category, description, confidence, clarification } = parsed;
    const icon  = type === 'income' ? '📈' : '📉';
    const label = type === 'income' ? 'Pemasukan' : 'Pengeluaran';
    const confidenceIcon = confidence === 'high' ? '✅' : confidence === 'medium' ? '🟡' : '🔴';
    const extraNote = confidence === 'low' && clarification
      ? `\n\n⚠️ _${clarification}_`
      : '';

    // Semua hasil AI → tampilkan kartu konfirmasi + 2 button
    const confirmText =
      `🤖 *AI mendeteksi transaksi ini:*${extraNote}\n\n` +
      `${icon} *${label}*\n` +
      `├─ Jumlah    : *${formatRupiah(amount)}*\n` +
      `├─ Kategori  : ${category}\n` +
      `╰─ Deskripsi : ${description || '-'}\n\n` +
      `${confidenceIcon} _Keyakinan AI: ${confidence}_\n\n` +
      `Konfirmasi atau batalkan transaksi ini 👇`;

    setPendingAction(from, `awaiting:catat:confirm:${JSON.stringify({ type, amount, category, description })}`);

    await sendWhatsAppButtons(
      from,
      confirmText,
      [
        { id: 'catat:confirm', title: '✅ Konfirmasi' },
        { id: 'catat:cancel',  title: '❌ Batal' },
      ],
      `${icon} KONFIRMASI TRANSAKSI`,
    );
    return true;
  }

  // ── .riwayat ────────────────────────────────────────────────────────────
  if (lower === '.riwayat' || lower === '.riwayat masuk' || lower === '.riwayat keluar') {
    const filterType = lower === '.riwayat masuk' ? 'income' : lower === '.riwayat keluar' ? 'expense' : undefined;
    await sendWhatsAppMessage(from, '⏳ Mengambil riwayat transaksi...');

    try {
      const txs = await apiGetTransactions(from, senderName, { type: filterType, limit: 10 });

      if (!txs || txs.length === 0) {
        await sendWhatsAppButtons(from,
          '📭 Belum ada transaksi yang tercatat.',
          [{ id: '.catat masuk 0 contoh', title: '➕ Catat Transaksi' }],
          '📋 RIWAYAT KOSONG');
        return true;
      }

      const lines = txs.map((tx, i) => {
        const icon = tx.type === 'income' ? '📈' : '📉';
        const sign = tx.type === 'income' ? '+' : '-';
        return `${i + 1}. ${icon} *${sign}${formatRupiah(tx.amount)}*\n   🏷️ ${tx.category}${tx.description ? ` — ${tx.description}` : ''}\n   📅 ${formatDate(tx.date)}\n   🆔 \`${tx.id.slice(0, 8)}\``;
      });

      const title = filterType === 'income' ? '📈 RIWAYAT PEMASUKAN' : filterType === 'expense' ? '📉 RIWAYAT PENGELUARAN' : '📋 RIWAYAT TRANSAKSI';
      const replyText = `╭────────────────────────────\n│  ${title}\n╰────────────────────────────\n${lines.join('\n──────────────────\n')}\n══════════════════════════════\n_Gunakan .hapus <8 digit ID> untuk menghapus._`;

      await sendWhatsAppButtons(from, replyText,
        [{ id: '.laporan', title: '📊 Laporan' }, { id: '.finance', title: '💰 Menu Finance' }],
        title);
    } catch (err: any) {
      await sendWhatsAppMessage(from, `❌ Gagal mengambil riwayat: ${err?.message ?? 'Coba lagi.'}`);
    }
    return true;
  }

  // ── .laporan ────────────────────────────────────────────────────────────
  if (lower === '.laporan' || lower === '.summary') {
    await sendWhatsAppMessage(from, '⏳ Mengambil laporan keuangan...');

    try {
      const summary = await apiGetFinanceSummary(from, senderName);
      const balance = summary.balance;
      const balanceIcon = balance >= 0 ? '🟢' : '🔴';
      const balanceLabel = balance >= 0 ? 'Surplus' : 'Defisit';

      const replyText = `╭────────────────────────────
│  📊 *LAPORAN KEUANGAN*
╰────────────────────────────
📈 *Total Pemasukan* : ${formatRupiah(summary.totalIncome)}
📉 *Total Pengeluaran*: ${formatRupiah(summary.totalExpense)}
──────────────────────────
${balanceIcon} *${balanceLabel}*      : ${formatRupiah(Math.abs(balance))}
📑 Jumlah Transaksi : ${summary.transactionCount}
══════════════════════════════
${balance >= 0 ? '✨ Keuangan kamu sehat! Pertahankan!' : '⚠️ Pengeluaran melebihi pemasukan!'}`;

      await sendWhatsAppButtons(from, replyText,
        [{ id: '.riwayat', title: '📋 Lihat Riwayat' }, { id: '.finance', title: '💰 Menu Finance' }],
        '📊 LAPORAN KEUANGAN');
    } catch (err: any) {
      await sendWhatsAppMessage(from, `❌ Gagal mengambil laporan: ${err?.message ?? 'Coba lagi.'}`);
    }
    return true;
  }

  // ── .hapus ──────────────────────────────────────────────────────────────
  if (lower.startsWith('.hapus ')) {
    const idPart = trimmed.slice(7).trim();
    if (!idPart) {
      await sendWhatsAppMessage(from, '❌ Masukkan ID transaksi.\nContoh: `.hapus a1b2c3d4`');
      return true;
    }

    await sendWhatsAppMessage(from, '⏳ Menghapus transaksi...');

    try {
      const txs = await apiGetTransactions(from, senderName, { limit: 50 });
      const target = txs.find((tx) => tx.id.startsWith(idPart));

      if (!target) {
        await sendWhatsAppMessage(from, `❌ Transaksi dengan ID \`${idPart}\` tidak ditemukan.\nGunakan *.riwayat* untuk melihat daftar ID.`);
        return true;
      }

      await apiDeleteTransaction(from, senderName, target.id);

      const icon = target.type === 'income' ? '📈' : '📉';
      await sendWhatsAppMessage(
        from,
        `✅ *Transaksi Dihapus!*\n${icon} ${formatRupiah(target.amount)} — ${target.category}${target.description ? ` (${target.description})` : ''} telah dihapus.`,
      );
    } catch (err: any) {
      await sendWhatsAppMessage(from, `❌ Gagal menghapus: ${err?.message ?? 'Coba lagi.'}`);
    }
    return true;
  }

  return false;
}
