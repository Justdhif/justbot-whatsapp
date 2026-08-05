import { sendWhatsAppMessage } from '../../infrastructure/gateways/whatsapp.gateway.js';
import { apiApproveQrSession } from '../../infrastructure/gateways/api-client.gateway.js';

export async function handleLoginCommand(
  from: string,
  userText: string
): Promise<boolean> {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();

  if (lower.startsWith('.login ')) {
    const sessionId = trimmed.slice(7).trim();

    if (!sessionId) {
      await sendWhatsAppMessage(from, '❌ Masukkan ID sesi login.\nContoh: `.login 12345678-abcd-...`');
      return true;
    }

    await sendWhatsAppMessage(from, '⏳ Memproses persetujuan login web...');

    try {
      await apiApproveQrSession(sessionId, from);

      const successMsg = `✅ *Login Web Berhasil Disetujui!*
══════════════════════════════
Halaman web aplikasi kamu akan otomatis dialihkan ke Dashboard dalam beberapa detik.

Selamat menggunakan JustBot Web! 🖥️✨`;
      await sendWhatsAppMessage(from, successMsg);
    } catch (err: any) {
      const errMsg = err?.message || '';
      let replyMsg = '❌ *Gagal Menyetujui Login*';
      
      if (errMsg.includes('belum terdaftar')) {
        replyMsg += '\n\nNomor WhatsApp Anda belum terdaftar di aplikasi JustBot. Silakan lakukan registrasi terlebih dahulu di halaman web dashboard.';
      } else if (errMsg.includes('kedaluwarsa')) {
        replyMsg += '\n\nSesi QR login Anda sudah kedaluwarsa. Silakan segarkan (refresh) QR Code di halaman web dashboard dan coba lagi.';
      } else {
        replyMsg += `\n\nKeterangan: ${errMsg || 'Sesi kedaluwarsa atau tidak valid.'}`;
      }
      
      await sendWhatsAppMessage(from, replyMsg);
    }
    return true;
  }

  return false;
}
