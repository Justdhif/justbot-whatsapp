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
      await sendWhatsAppMessage(
        from,
        `❌ Gagal menyetujui login:\n${err?.message || 'Sesi kedaluwarsa atau tidak valid.'}`
      );
    }
    return true;
  }

  return false;
}
