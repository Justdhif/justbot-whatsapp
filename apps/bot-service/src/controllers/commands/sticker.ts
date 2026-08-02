import { sendWhatsAppMessage, sendWhatsAppSticker } from '../../infrastructure/gateways/whatsapp.gateway.js';
import { generateBratSticker, generateBratVideoSticker } from '../../infrastructure/gateways/brat.gateway.js';
import { generateStickerFromWhatsAppMedia } from '../../infrastructure/gateways/whatsapp.gateway.js';
import { clearUserLastImage } from '../../infrastructure/store/session.store.js';

export async function handleStickerCommand(
  from: string,
  userText: string,
  session: any
): Promise<boolean> {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();

  
  const bratVideoCommandMatch = trimmed.match(/^\.bratv(?:\s+(.*))?$/i);
  if (bratVideoCommandMatch) {
    const bratText = (bratVideoCommandMatch[1] || '').trim();
    if (!bratText) {
      await sendWhatsAppMessage(from, 'Ketik `.bratv teks kamu` untuk membuat sticker Brat animasi.');
      return true;
    }
    await sendWhatsAppMessage(from, '⏳ Sedang membuat sticker Brat animasi...');
    const stickerBuffer = await generateBratVideoSticker(bratText);
    const stickerSent = await sendWhatsAppSticker(from, stickerBuffer);
    if (!stickerSent) {
      await sendWhatsAppMessage(from, 'Gagal mengirim sticker Brat animasi. Coba lagi beberapa saat.');
    }
    return true;
  }

  
  const stickerCommandMatch = trimmed.match(/^\.sticker(?:\s+(.*))?$/i);
  if (stickerCommandMatch) {
    const lastImageMediaId = session.lastImageMediaId;
    const commandText = (stickerCommandMatch[1] || "").trim();
    if (commandText) {
      await sendWhatsAppMessage(from, "Kirim gambar lalu caption `.sticker` atau reply gambar dengan `.sticker` untuk membuat sticker.");
      return true;
    }
    if (!lastImageMediaId) {
      await sendWhatsAppMessage(from, "Saya belum menemukan gambar terakhir untuk diubah menjadi sticker. Kirim foto dulu lalu reply `.sticker`.");
      return true;
    }
    await sendWhatsAppMessage(from, "⏳ Sedang membuat sticker dari gambar terakhir...");
    const stickerBuffer = await generateStickerFromWhatsAppMedia(lastImageMediaId);
    if (!stickerBuffer) {
      await sendWhatsAppMessage(from, "Gagal membuat sticker dari gambar terakhir. Coba kirim ulang fotonya.");
      return true;
    }
    const stickerSent = await sendWhatsAppSticker(from, stickerBuffer);
    if (!stickerSent) {
      await sendWhatsAppMessage(from, "Gagal mengirim sticker. Coba lagi beberapa saat.");
    }
    clearUserLastImage(from);
    return true;
  }

  
  const bratCommandMatch = trimmed.match(/^\.brat(?:\s+(.*))?$/i);
  if (bratCommandMatch) {
    const bratText = (bratCommandMatch[1] || '').trim();
    if (!bratText) {
      await sendWhatsAppMessage(from, 'Ketik `.brat teks kamu` untuk membuat sticker Brat.');
      return true;
    }
    await sendWhatsAppMessage(from, '⏳ Sedang membuat sticker Brat...');
    const stickerBuffer = await generateBratSticker(bratText);
    const stickerSent = await sendWhatsAppSticker(from, stickerBuffer);
    if (!stickerSent) {
      await sendWhatsAppMessage(from, 'Gagal mengirim sticker Brat. Coba lagi beberapa saat.');
    }
    return true;
  }

  return false;
}
