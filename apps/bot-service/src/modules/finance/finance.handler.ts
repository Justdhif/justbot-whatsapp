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

  // 3. System prompt for CuanBuddy AI Finance Assistant
  const systemPrompt = `Anda adalah 💰 *CUANBUDDY FINANCE AI* — Asisten & Perencana Keuangan Cerdas.

Aturan Respon:
1. Mulai dengan Header ASCII / Pembatas estetik (💰 📊 💵).
2. Jika menjawab pertanyaan umum keuangan, sajikan tips hemat, budgeting 50/30/20, atau saran investasi dengan format tebal (*bold*), miring (_italic_), list poin, dan pembatas yang sangat rapi dan menarik.
3. Status Koneksi CuanBuddy saat ini: ${isConnected ? '🟢 Terhubung' : '🔴 Belum Terhubung'}.`;

  return await askGroqAI(userPrompt, systemPrompt);
}

export function getFinanceIntroMessage(senderName?: string): string {
  const greetingName = senderName ? ` ${senderName}` : '';
  
  return `╭────────────────────────────
│  💰 *CUANBUDDY FINANCE ASSISTANT* 💰
╰────────────────────────────
Halo${greetingName}! Selamat datang di konsultan keuangan pintar CuanBuddy.

Di sini Anda bisa berkonsultasi seputar perencanaan keuangan, budgeting, tips hemat, hingga investasi.

✨ *Integrasi CuanBuddy App*:
Anda bisa menghubungkan nomor WhatsApp ini ke akun aplikasi *CuanBuddy* Anda untuk mensinkronisasi data keuangan secara instan!

══════════════════════════════════════
👇 *Silakan klik tombol di bawah untuk memeriksa status koneksi akun Anda:*`;
}

export async function processCuanBuddyCheck(phoneNumber: string, senderName?: string): Promise<string> {
  const greetingName = senderName ? ` ${senderName}` : '';
  
  // 1. Fetch from database API
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
