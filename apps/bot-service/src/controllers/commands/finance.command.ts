import {
  sendWhatsAppMessage,
  sendWhatsAppButtons,
} from '../../infrastructure/gateways/whatsapp.gateway.js';
import {
  cuanbuddyConnectOtp,
  cuanbuddyGetTransactions,
} from '../../infrastructure/gateways/cuanbuddy.gateway.js';
import {
  getUserSession,
  setFinanceOtpPending,
  setCuanbuddyPhone,
  getCuanbuddyPhone,
} from '../../infrastructure/store/session.store.js';



function formatCurrency(amount: number, currency = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function financeHelpText(connectedEmail?: string): string {
  const status = connectedEmail
    ? `🟢 *Terhubung* — ${connectedEmail}`
    : `🔴 *Belum Terhubung*`;

  return `╭────────────────────────────────────
│  💰 *CUAN BUDDY FINANCE*
╰────────────────────────────────────
📡 *Status Akun:* ${status}

💡 *Panduan Command Finance:*

📋 *.transaksi* — Tampilkan 10 transaksi terakhir dari CuanBuddy

🔗 *.connect-finance* — Panduan cara menghubungkan akun CuanBuddy

════════════════════════════════════════
📌 _Kirim command di atas kapan saja untuk menggunakan fitur Finance CuanBuddy._`;
}



async function handleConnectFinanceCommand(
  from: string,
  senderName: string
): Promise<boolean> {
  const greeting = senderName ? ` ${senderName}` : '';
  const guideText = `╭────────────────────────────────────
│  🔗 *HUBUNGKAN AKUN CUANBUDDY*
╰────────────────────────────────────
Halo${greeting}! Untuk menggunakan fitur Finance CuanBuddy di WhatsApp, Anda perlu menghubungkan akun terlebih dahulu.

📋 *Cara Mendapatkan Kode OTP:*
1️⃣ Buka aplikasi *CuanBuddy* di HP Anda
2️⃣ Masuk ke menu *Profil → Pengaturan*
3️⃣ Pilih *Hubungkan WhatsApp*
4️⃣ Salin 6-digit kode OTP yang muncul

════════════════════════════════════════
Setelah mendapat kode OTP, klik tombol *Masukkan OTP* di bawah!`;

  await sendWhatsAppButtons(
    from,
    guideText,
    [{ id: 'action:finance:enter-otp', title: '🔑 Masukkan OTP' }],
    '🔗 CONNECT CUANBUDDY'
  );
  return true;
}



async function handleEnterOtpAction(from: string): Promise<boolean> {
  setFinanceOtpPending(from, true);
  await sendWhatsAppMessage(
    from,
    `🔑 *Masukkan Kode OTP CuanBuddy*\n\nSilakan ketik *6-digit kode OTP* yang Anda dapat dari aplikasi CuanBuddy dan kirim ke chat ini.\n\n_Contoh: 123456_`
  );
  return true;
}



export async function handleFinanceOtpInput(
  from: string,
  text: string
): Promise<boolean> {
  const session = getUserSession(from);
  if (!session.awaitingFinanceOtp) return false;

  const trimmed = text.trim();
  if (!/^\d{6}$/.test(trimmed)) {
    await sendWhatsAppMessage(
      from,
      `❌ Kode OTP tidak valid. OTP harus berupa *6 digit angka*.\n\nCoba lagi atau ketik *.connect-finance* untuk membatalkan.`
    );
    return true;
  }

  await sendWhatsAppMessage(from, `⏳ _Memverifikasi kode OTP..._`);

  const result = await cuanbuddyConnectOtp(from, trimmed);

  if (!result.success) {
    await sendWhatsAppMessage(
      from,
      `❌ *Pairing Gagal*\n\n${result.message}\n\nSilakan coba lagi atau minta kode OTP baru di aplikasi CuanBuddy.`
    );
    setFinanceOtpPending(from, false);
    return true;
  }

  
  setCuanbuddyPhone(from, from);

  const welcomeText = `🎉 *Selamat! Akun CuanBuddy Berhasil Terhubung!*

Akun WhatsApp Anda kini terhubung dengan email: *${result.email || '-'}*

${financeHelpText(result.email)}`;

  await sendWhatsAppMessage(from, welcomeText);
  return true;
}



async function handleTransaksiCommand(from: string): Promise<boolean> {
  const phone = getCuanbuddyPhone(from);
  if (!phone) {
    await sendWhatsAppButtons(
      from,
      `🔒 *Fitur ini membutuhkan akun CuanBuddy yang terhubung.*\n\nNomor WhatsApp Anda belum dipairing. Klik tombol di bawah untuk memulai proses hubungkan akun.`,
      [{ id: 'action:finance:enter-otp', title: '🔑 Masukkan OTP' }],
      '🔒 AKUN BELUM TERHUBUNG'
    );
    return true;
  }

  await sendWhatsAppMessage(from, `⏳ _Mengambil data transaksi dari CuanBuddy..._`);

  const transactions = await cuanbuddyGetTransactions(phone);

  if (!transactions || transactions.length === 0) {
    await sendWhatsAppMessage(
      from,
      `📭 *Tidak ada transaksi* yang ditemukan di akun CuanBuddy Anda.\n\nCatat transaksi pertama Anda melalui aplikasi CuanBuddy!`
    );
    return true;
  }

  const lines = transactions.slice(0, 10).map((tx: any, i: number) => {
    const icon = tx.type === 'income' ? '💰' : '💸';
    const sign = tx.type === 'income' ? '+' : '-';
    const amount = formatCurrency(Number(tx.amount), tx.currency || 'IDR');
    const date = tx.date
      ? new Date(tx.date).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '-';
    return `${i + 1}. ${icon} *${tx.title || 'Transaksi'}*\n   ${sign}${amount} • ${date}`;
  });

  const message = `╭────────────────────────────────────
│  📋 *10 TRANSAKSI TERAKHIR*
╰────────────────────────────────────
${lines.join('\n\n')}

════════════════════════════════════════
📌 _Data dari akun CuanBuddy Anda._`;

  await sendWhatsAppMessage(from, message);
  return true;
}



export async function handleFinanceCommand(
  from: string,
  userText: string,
  senderName: string,
  session: any
): Promise<boolean> {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();

  
  if (lower === 'action:finance:enter-otp') {
    return await handleEnterOtpAction(from);
  }

  
  if (session.awaitingFinanceOtp && /^\d{6}$/.test(trimmed)) {
    return await handleFinanceOtpInput(from, trimmed);
  }

  
  if (lower === '.connect-finance') {
    return await handleConnectFinanceCommand(from, senderName);
  }

  
  if (lower === '.transaksi') {
    return await handleTransaksiCommand(from);
  }

  
  if (lower === '.finance-help') {
    const phone = getCuanbuddyPhone(from);
    await sendWhatsAppMessage(from, financeHelpText(phone ? undefined : undefined));
    return true;
  }

  return false;
}
