import { sendWhatsAppCtaUrlButton } from '../../infrastructure/gateways/whatsapp.gateway.js';
import { changeFont } from '../../utils/font.js';

/**
 * Handler command .manager
 * Memberikan informasi lengkap mengenai Akun Manager, kelebihan, list command,
 * dan tombol/link pendaftaran langsung.
 */
export async function handleManagerCommand(
  from: string,
  userText: string,
  senderName: string
): Promise<boolean> {
  const lower = userText.trim().toLowerCase();

  if (lower === ".manager") {
    const titleManager = changeFont('JUSTBOT MANAGER', 'smallCaps');
    
    const infoText = 
      `╭─── o「 ${titleManager} 」o\n` +
      `│\n` +
      `📌 *Apa itu Akun Manager?*\n` +
      `Akun Manager adalah akun khusus pengguna JustBot untuk menikmati asisten personal canggih (pencatatan keuangan & agenda pengingat) yang terhubung langsung dengan WhatsApp Anda.\n\n` +
      `⭐️ *Kelebihan Akun Manager*:\n` +
      `├─✦ *Akses Web Dashboard GUI*: Pantau grafik pengeluaran bulanan dan kelola pengingat Anda dengan tampilan web premium.\n` +
      `├─✦ *Siklus Sesi Tanpa Batas*: Login tetap tersimpan secara permanen (seperti Instagram/TikTok) tanpa harus berulang kali login.\n` +
      `├─✦ *Keamanan OTP*: Pendaftaran diverifikasi aman menggunakan kode OTP WhatsApp secara real-time.\n` +
      `├─✦ *Multi-Platform*: Catat lewat chat WhatsApp, pantau lewat browser web.\n` +
      `│\n` +
      `🛠️ *Fitur & Perintah (Command) Lanjutan*:\n` +
      `├─✦ *Pencatatan Keuangan*:\n` +
      `│   • \`.catat <nominal> <kategori> <keterangan>\`\n` +
      `│   • \`.riwayat\` / \`.laporan\` / \`.summary\`\n` +
      `├─✦ *Pengingat Pintar (Reminder)*:\n` +
      `│   • \`.ingatkan <waktu> <deskripsi>\`\n` +
      `│   • \`.pengingat\` (Melihat daftar pengingat aktif)\n` +
      `│\n` +
      `══════════════════════════════\n` +
      `Klik tombol di bawah ini untuk membuka halaman pendaftaran! 👇`;

    await sendWhatsAppCtaUrlButton(
      from,
      infoText,
      'Daftar Sekarang',
      'https://justbot-manager.netlify.app/register',
      '💼 AKUN MANAGER',
    );
    return true;
  }

  return false;
}
