import { askGroqAI } from '../../services/groq.service.js';
import { getCuanBuddyUserByPhone, pairWhatsAppWithOtp } from '../../services/cuanbuddy.service.js';

export async function handleFinanceModule(userPrompt: string, phoneNumber?: string, senderName?: string): Promise<string> {
  const trimmed = userPrompt.trim();

  // 1. Check if user is attempting OTP 6-digit verification
  if (/^\d{6}$/.test(trimmed) && phoneNumber) {
    const pairResult = await pairWhatsAppWithOtp(phoneNumber, trimmed);
    if (pairResult.success) {
      return `🎉 *SELAMAT! AKUN CUANBUDDY TERHUBUNG!* 🎉
══════════════════════════════════════

Nomor WhatsApp Anda (*${phoneNumber}*) kini telah terhubung dengan akun aplikasi *CuanBuddy*.

💼 *Sekarang Anda bisa*:
├─ Mencatat pengeluaran & pemasukan otomatis
└─ Konsultasi keuangan berbasis data real-time

_Silakan chat apa saja untuk mulai mengobrol!_`;
    } else {
      return `❌ *GAGAL MENGHUBUNGKAN AKUN*
══════════════════════════════════════
${pairResult.message}

📌 *Petunjuk*: Silakan ambil kode OTP 6-digit terbaru dari menu Profil di aplikasi CuanBuddy dan kirimkan kembali ke sini.`;
    }
  }

  // 2. Check user's CuanBuddy connection status
  let isConnected = false;
  if (phoneNumber) {
    const conn = await getCuanBuddyUserByPhone(phoneNumber);
    isConnected = conn.isConnected;
  }

  // 3. System prompt for General Finance Consultant
  const systemPrompt = `Anda adalah 💰 *JUSTBOT FINANCE CONSULTANT AI* — Konsultan Keuangan Pribadi Cerdas.

Aturan Respon:
1. Mulai dengan Header ASCII Box eksklusif seperti:
╭────────────────────────────
│  💰  *JUSTBOT FINANCE CONSULTANT*  💰
╰────────────────────────────
2. Gunakan pembatas estetik (══════════════════════).
3. Bantu pengguna menjawab konsultasi keuangan secara umum (budgeting, pengelolaan gaji, investasi).
4. Catatan integrasi aplikasi CuanBuddy: ${isConnected ? '🟢 Terhubung' : '🔴 Belum Terhubung'}.`;

  return await askGroqAI(userPrompt, systemPrompt);
}

export function getFinanceIntroMessage(senderName?: string): string {
  const greetingName = senderName ? ` ${senderName}` : '';
  
  return `╭────────────────────────────
│  💰 *CUANBUDDY INTEGRATION* 💰
╰────────────────────────────
Halo${greetingName}! Selamat datang di gerbang integrasi CuanBuddy.

Di sini Anda bisa menghubungkan bot ini ke aplikasi *CuanBuddy* Anda untuk mencatat pengeluaran otomatis secara realtime.

══════════════════════════════════════
👇 *Klik tombol status di bawah untuk mengecek koneksi akun Anda:*`;
}

export async function processCuanBuddyCheck(phoneNumber: string, senderName?: string): Promise<string> {
  const greetingName = senderName ? ` ${senderName}` : '';
  
  // Fetch from database API
  const conn = await getCuanBuddyUserByPhone(phoneNumber);
  
  if (conn.isConnected) {
    return `╭────────────────────────────
│  🟢 *WELCOME BACK TO CUANBUDDY*
╰────────────────────────────
Halo${greetingName}! Akun Anda telah teridentifikasi.

👤 *User ID:* ${conn.user?.userId || 'User-CuanBuddy'}
📱 *WhatsApp:* ${phoneNumber}
🟢 *Koneksi:* Aktif & Terintegrasi

══════════════════════════════════════
Semua catatan transaksi Anda di chat ini akan langsung tersinkronisasi otomatis ke dashboard CuanBuddy Anda! 🚀`;
  } else {
    return `╭────────────────────────────
│  🔴 *AKUN BELUM TERHUBUNG*
╰────────────────────────────
Halo${greetingName}! Nomor WhatsApp Anda (*${phoneNumber}*) belum terhubung dengan akun aplikasi *CuanBuddy*.

📌 *Cara Menghubungkan Akun*:
1. Buka aplikasi / website *CuanBuddy*.
2. Masuk ke menu *Pengaturan Profil* ➔ *Hubungkan WhatsApp*.
3. Dapatkan **6-digit Kode OTP / PIN Integrasi**.
4. Kirimkan 6-digit kode OTP tersebut langsung ke chat WhatsApp ini!

 Contoh: \`123456\`

══════════════════════════════════════
_Setelah terhubung, Anda bisa langsung mencatat pengeluaran otomatis lewat WhatsApp!_`;
  }
}
