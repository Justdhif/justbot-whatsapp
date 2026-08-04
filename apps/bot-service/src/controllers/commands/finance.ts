import {
  sendWhatsAppMessage,
  sendWhatsAppButtons,
} from '../../infrastructure/gateways/whatsapp.gateway.js';
import { setUserActiveMode } from '../../infrastructure/store/session.store.js';
import {
  apiGetTransactions,
  apiCreateTransaction,
  apiDeleteTransaction,
  apiGetFinanceSummary,
} from '../../infrastructure/gateways/api-client.gateway.js';

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

// ─── Finance Command Handler ──────────────────────────────────────────────────

/**
 * Menangani semua perintah finance CRUD.
 * Trigger: userText dimulai dengan `.finance` atau alias perintah keuangan.
 *
 * Daftar Perintah:
 *   .finance              → masuk mode finance + tampilkan menu
 *   .catat masuk <jumlah> <kategori> [deskripsi]
 *   .catat keluar <jumlah> <kategori> [deskripsi]
 *   .riwayat [masuk|keluar]
 *   .laporan              → ringkasan keuangan
 *   .hapus <id>           → hapus transaksi
 */
export async function handleFinanceCommand(
  from: string,
  userText: string,
  senderName: string,
): Promise<boolean> {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();

  // ── .finance ──────────────────────────────────────────────────────────────
  if (lower === '.finance' || lower === '.keuangan') {
    setUserActiveMode(from, 'finance');

    const menuText = `╭────────────────────────────
│  💰 *FINANCE MANAGER* 💰
╰────────────────────────────
Halo${senderName ? ' ' + senderName : ''}! Mode keuangan aktif.

📝 *Perintah yang tersedia:*

├─✦ *.catat masuk <jumlah> <kategori>* [deskripsi]
│   Contoh: \`.catat masuk 500000 gaji "gaji bulan agustus"\`
│
├─✦ *.catat keluar <jumlah> <kategori>* [deskripsi]
│   Contoh: \`.catat keluar 35000 makan "makan siang"\`
│
├─✦ *.riwayat* — lihat 10 transaksi terakhir
├─✦ *.riwayat masuk* — khusus pemasukan
├─✦ *.riwayat keluar* — khusus pengeluaran
├─✦ *.laporan* — ringkasan total keuangan
├─✦ *.hapus <id>* — hapus transaksi berdasarkan ID
╰────────────────────────────
💡 _Atau chat biasa untuk konsultasi keuangan dengan AI._`;

    const buttons = [
      { id: '.laporan', title: '📊 Laporan' },
      { id: '.riwayat', title: '📋 Riwayat' },
      { id: 'action:exit', title: '🔴 Exit' },
    ];
    await sendWhatsAppButtons(from, menuText, buttons, '💰 FINANCE MANAGER');
    return true;
  }

  // ── .catat ────────────────────────────────────────────────────────────────
  if (lower.startsWith('.catat ')) {
    const parts = trimmed.slice(7).trim(); // hapus ".catat "
    // Format: <masuk|keluar> <jumlah> <kategori> [deskripsi dalam tanda kutip]
    const match = parts.match(
      /^(masuk|keluar)\s+(\d[\d.,]*)\s+(\S+)(?:\s+"([^"]*)")?(?:\s+(.*))?/i,
    );

    if (!match) {
      await sendWhatsAppMessage(
        from,
        `❌ Format tidak valid.\n\nContoh yang benar:\n\`.catat masuk 500000 gaji "gaji bulan ini"\`\n\`.catat keluar 25000 makan\``,
      );
      return true;
    }

    const direction = match[1].toLowerCase();
    const type = direction === 'masuk' ? 'income' : 'expense';
    const amountStr = match[2].replace(/[.,]/g, '');
    const amount = parseInt(amountStr, 10);
    const category = match[3];
    const description = match[4] ?? match[5] ?? undefined;

    if (isNaN(amount) || amount <= 0) {
      await sendWhatsAppMessage(from, '❌ Jumlah tidak valid. Masukkan angka yang benar.');
      return true;
    }

    await sendWhatsAppMessage(from, '⏳ Menyimpan transaksi...');

    try {
      const tx = await apiCreateTransaction(from, senderName, {
        type,
        amount,
        category,
        description,
        date: new Date().toISOString().split('T')[0],
      });

      const icon = type === 'income' ? '📈' : '📉';
      const label = type === 'income' ? 'PEMASUKAN' : 'PENGELUARAN';
      const replyText = `✅ *Transaksi Tersimpan!*
══════════════════════════════
${icon} *${label}*
💰 Jumlah : ${formatRupiah(amount)}
🏷️ Kategori: ${category}${description ? `\n📝 Deskripsi: ${description}` : ''}
📅 Tanggal : ${formatDate(tx.date ?? new Date().toISOString())}
🆔 ID      : \`${tx.id.slice(0, 8)}...\`
══════════════════════════════
_Gunakan .hapus ${tx.id.slice(0, 8)} untuk menghapus transaksi ini._`;

      const buttons = [
        { id: '.riwayat', title: '📋 Lihat Riwayat' },
        { id: '.laporan', title: '📊 Laporan' },
      ];
      await sendWhatsAppButtons(from, replyText, buttons, `${icon} TRANSAKSI DICATAT`);
    } catch (err: any) {
      await sendWhatsAppMessage(from, `❌ Gagal menyimpan: ${err?.message ?? 'Coba lagi.'}`);
    }
    return true;
  }

  // ── .riwayat ──────────────────────────────────────────────────────────────
  if (lower === '.riwayat' || lower === '.riwayat masuk' || lower === '.riwayat keluar') {
    const filterType = lower === '.riwayat masuk'
      ? 'income'
      : lower === '.riwayat keluar'
        ? 'expense'
        : undefined;

    await sendWhatsAppMessage(from, '⏳ Mengambil riwayat transaksi...');

    try {
      const txs = await apiGetTransactions(from, senderName, { type: filterType, limit: 10 });

      if (!txs || txs.length === 0) {
        await sendWhatsAppMessage(from, '📭 Belum ada transaksi yang tercatat.');
        return true;
      }

      const lines = txs.map((tx, i) => {
        const icon = tx.type === 'income' ? '📈' : '📉';
        const sign = tx.type === 'income' ? '+' : '-';
        return `${i + 1}. ${icon} *${sign}${formatRupiah(tx.amount)}*\n   🏷️ ${tx.category}${tx.description ? ` — ${tx.description}` : ''}\n   📅 ${formatDate(tx.date)}\n   🆔 \`${tx.id.slice(0, 8)}\``;
      });

      const title = filterType === 'income'
        ? '📈 RIWAYAT PEMASUKAN'
        : filterType === 'expense'
          ? '📉 RIWAYAT PENGELUARAN'
          : '📋 RIWAYAT TRANSAKSI';

      const replyText = `╭────────────────────────────
│  ${title}
╰────────────────────────────
${lines.join('\n──────────────────────────\n')}
══════════════════════════════
_Gunakan .hapus <8 digit ID> untuk menghapus._`;

      const buttons = [
        { id: '.laporan', title: '📊 Laporan' },
        { id: '.finance', title: '💰 Menu Finance' },
      ];
      await sendWhatsAppButtons(from, replyText, buttons, title);
    } catch (err: any) {
      await sendWhatsAppMessage(from, `❌ Gagal mengambil riwayat: ${err?.message ?? 'Coba lagi.'}`);
    }
    return true;
  }

  // ── .laporan ──────────────────────────────────────────────────────────────
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
${balanceIcon} *${balanceLabel}*     : ${formatRupiah(Math.abs(balance))}
📑 Jumlah Transaksi : ${summary.transactionCount}
══════════════════════════════
${balance >= 0 ? '✨ Keuangan kamu sehat!' : '⚠️ Pengeluaran melebihi pemasukan!'}`;

      const buttons = [
        { id: '.riwayat', title: '📋 Lihat Riwayat' },
        { id: '.finance', title: '💰 Menu Finance' },
      ];
      await sendWhatsAppButtons(from, replyText, buttons, '📊 LAPORAN KEUANGAN');
    } catch (err: any) {
      await sendWhatsAppMessage(from, `❌ Gagal mengambil laporan: ${err?.message ?? 'Coba lagi.'}`);
    }
    return true;
  }

  // ── .hapus ────────────────────────────────────────────────────────────────
  if (lower.startsWith('.hapus ')) {
    const idPart = trimmed.slice(7).trim();
    if (!idPart) {
      await sendWhatsAppMessage(from, '❌ Masukkan ID transaksi.\nContoh: `.hapus a1b2c3d4`');
      return true;
    }

    await sendWhatsAppMessage(from, '⏳ Menghapus transaksi...');

    try {
      // Ambil riwayat, cari transaksi yang ID-nya cocok (partial match 8 char pertama)
      const txs = await apiGetTransactions(from, senderName, { limit: 50 });
      const target = txs.find((tx) => tx.id.startsWith(idPart));

      if (!target) {
        await sendWhatsAppMessage(from, `❌ Transaksi dengan ID \`${idPart}\` tidak ditemukan.\nGunakan .riwayat untuk melihat daftar ID transaksi.`);
        return true;
      }

      await apiDeleteTransaction(from, senderName, target.id);

      const icon = target.type === 'income' ? '📈' : '📉';
      await sendWhatsAppMessage(
        from,
        `✅ *Transaksi Dihapus!*\n${icon} ${formatRupiah(target.amount)} — ${target.category}${target.description ? ` (${target.description})` : ''} berhasil dihapus.`,
      );
    } catch (err: any) {
      await sendWhatsAppMessage(from, `❌ Gagal menghapus: ${err?.message ?? 'Coba lagi.'}`);
    }
    return true;
  }

  return false;
}
