import { sendWhatsAppCtaUrlButton } from '../../infrastructure/gateways/whatsapp.gateway.js';
import { changeFont } from '../../utils/font.js';


export async function handleManagerCommand(
  from: string,
  userText: string,
  senderName: string
): Promise<boolean> {
  const lower = userText.trim().toLowerCase();

  if (lower === ".manager") {
    const titleManager = changeFont('JUSTBOT MANAGER', 'smallCaps');
    const titleShortcuts = changeFont('MANAGER COMMAND', 'smallCaps');
    
    const infoText = 
      `╭─── o「 ${titleManager} 」o\n` +
      `│\n` +
      `📌 *Apa itu Akun Manager?*\n` +
      `Akun khusus pengguna JustBot untuk membantu mengelola, menyimpan, dan memantau seluruh data Anda secara terintegrasi melalui chat WhatsApp dan web browser.\n\n` +
      `├─── o(" ${titleShortcuts} ")\n` +
      `├─✦  *.catat* _<nominal> <kategori> <keterangan>_\n` +
      `├─✦  *.riwayat* _[masuk|keluar]_\n` +
      `├─✦  *.laporan*\n` +
      `├─✦  *.summary*\n` +
      `├─✦  *.ingatkan* _<waktu> <deskripsi>_\n` +
      `├─✦  *.pengingat*\n` +
      `╰────────────────────────────\n` +
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
