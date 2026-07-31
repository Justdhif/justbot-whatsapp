import { askGroqAI } from '../../services/groq.service.js';
import { getCuanBuddyUserByPhone, pairWhatsAppWithOtp, recordTransactionToCuanBuddy } from '../../services/cuanbuddy.service.js';

export async function handleFinanceModule(userPrompt: string, phoneNumber?: string, senderName?: string): Promise<string> {
  const nameStr = senderName ? ` (${senderName})` : '';
  const trimmed = userPrompt.trim();

  // 1. Check if user is attempting OTP 6-digit verification
  if (/^\d{6}$/.test(trimmed) && phoneNumber) {
    const pairResult = await pairWhatsAppWithOtp(phoneNumber, trimmed);
    if (pairResult.success) {
      return `🎉 *SELAMAT! AKUN CUANBUDDY BERHASIL TERHUBUNG!* 🎉\n══════════════════════════════════════\n\nNomor WhatsApp Anda (${phoneNumber}) kini telah resmi terhubung dengan akun aplikasi *CuanBuddy*.\n\nSekarang Anda bisa langsung mencatat pengeluaran/pemasukan secara otomatis di sini!\n\n_Contoh Chat_: \`Beli kopi 25rb\` atau \`Gaji bulanan 5jt\``;
    } else {
      return `❌ *GAGAL MENGHUBUNGKAN AKUN*\n══════════════════════════════════════\n${pairResult.message}\n\n📌 *Petunjuk*: Pastikan Anda mengambil 6-digit kode OTP terbaru dari menu Profil di aplikasi CuanBuddy.`;
    }
  }

  // 2. Check user's CuanBuddy connection status
  let isConnected = false;
  if (phoneNumber) {
    const conn = await getCuanBuddyUserByPhone(phoneNumber);
    isConnected = conn.isConnected;
  }

  // 3. System prompt for CuanBuddy AI Finance Assistant
  const systemPrompt = `Anda adalah 💰 *CUANBUDDY FINANCE AI* — Konsultan & Pencatat Keuangan Otomatis dari Aplikasi *CuanBuddy*.

Status Pengguna: ${isConnected ? '🟢 Terhubung Akun CuanBuddy' : '🔴 Belum Terhubung (Konsultasi Umum)'}

Tugas Anda:
1. Memberikan saran finansial, budgeting 50/30/20, analisis pengeluaran, & tips investasi secara profesional.
2. Jika pengguna meminta mencatat transaksi (misal 'beli kopi 25rb') tetapi BELUM terhubung, ingatkan dengan sopan untuk menghubungkan akun via 6-digit OTP CuanBuddy.
3. Gunakan format WhatsApp (*bold*, _italic_, bullet points, & emoji 💰 📊 💵).`;

  return await askGroqAI(userPrompt, systemPrompt);
}
