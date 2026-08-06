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
      `Asisten personal canggih (Catat Keuangan & Pengingat) yang terhubung langsung dengan WhatsApp Anda.\n\n` +
      `⭐️ *Kelebihan Akun Manager*:\n` +
      `├─✦ *Web Dashboard*: Pantau grafik pengeluaran & list pengingat.\n` +
      `├─✦ *Sesi Permanen*: Login tersimpan (seperti Instagram/TikTok).\n` +
      `├─✦ *Keamanan OTP*: Verifikasi pendaftaran instan via WhatsApp.\n` +
      `├─✦ *Multi-Platform*: Catat via WA, pantau via web browser.\n` +
      `│\n` +
      `🛠️ *Fitur & Perintah Lanjutan*:\n` +
      `├─✦ *Catat Keuangan*:\n` +
      `│   • \`.catat <nominal> <kategori> <keterangan>\`\n` +
      `│   • \`.riwayat\` / \`.laporan\` / \`.summary\`\n` +
      `├─✦ *Pengingat Pintar*:\n` +
      `│   • \`.ingatkan <waktu> <deskripsi>\`\n` +
      `│   • \`.pengingat\` (Melihat daftar aktif)\n` +
      `│\n` +
      `══════════════════════════════\n` +
      `Klik tombol di bawah untuk membuka halaman pendaftaran! 👇`;

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
