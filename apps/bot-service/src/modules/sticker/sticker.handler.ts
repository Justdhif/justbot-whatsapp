import { sendWhatsAppSticker, uploadWhatsAppMedia } from '../../services/whatsapp.service.js';
import { logger } from '../../utils/logger.js';
import axios from 'axios';

export async function handleStickerModule(userPrompt: string, to: string): Promise<string> {
  const trimmed = userPrompt.trim();
  if (!trimmed) {
    return `🎨 *STICKER GENERATOR MODULE* 🎨
══════════════════════════════════════

Silakan gunakan perintah khusus berikut untuk membuat stiker secara instan:

1. 🤍 *Stiker Brat Text (Latar Putih)*
   ├─ Perintah: \`.brat <teks>\`
   └─ Contoh: \`.brat au ah bete\`

2. 🎬 *Stiker Brat Animated/Vid (Latar Putih Berkelip)*
   ├─ Perintah: \`.bratvid <teks>\`
   └─ Contoh: \`.bratvid overthinking\`

3. 💬 *Stiker Quick Chat (Bubble Chat)*
   ├─ Perintah: \`.qchat <teks>\`
   └─ Contoh: \`.qchat otw bro\`

4. 🍏 *Stiker iPhone Style Quick Chat*
   ├─ Perintah: \`.qchat-ios <teks>\`
   └─ Contoh: \`.qchat-ios besok yaa\`

══════════════════════════════════════
✨ _Kirimkan teks yang ingin dijadikan stiker dengan format di atas!_`;
  }
  return '';
}

/**
 * Generates WebP sticker, downloads its buffer, and uploads it to Meta Cloud API.
 * Uses highly-stable lolhuman API engine directly as fallback to avoid host-lookup failures.
 */
export async function generateAndSendSticker(
  to: string,
  type: 'brat' | 'bratvid' | 'qchat' | 'qchat-ios',
  text: string
): Promise<boolean> {
  try {
    const encodedText = encodeURIComponent(text);
    let stickerUrl = '';

    if (type === 'brat') {
      // Use Lolhuman Brat Generator directly (extremely fast and reliable WebP API)
      stickerUrl = `https://api.lolhuman.xyz/api/brat?apikey=free&text=${encodedText}`;
    } else if (type === 'bratvid') {
      // Animated Brat GIF generator fallback via stable fastrestapis CDN URL
      stickerUrl = `https://fastrestapis.fasturl.cloud/creator/brat-gif?text=${encodedText}&background=white`;
    } else if (type === 'qchat') {
      // WhatsApp Android Style Bubble chat sticker
      stickerUrl = `https://api.lolhuman.xyz/api/qc?apikey=free&text=${encodedText}&username=JustBot&avatar=https://picsum.photos/200`;
    } else if (type === 'qchat-ios') {
      // WhatsApp iOS iMessage Style Bubble chat sticker
      stickerUrl = `https://api.lolhuman.xyz/api/qc2?apikey=free&text=${encodedText}&username=JustBot&avatar=https://picsum.photos/200`;
    }

    logger.info({ type, text, stickerUrl }, 'Generating sticker buffer via API');

    // Download WebP buffer directly with fallback support
    let response;
    try {
      response = await axios.get(stickerUrl, { responseType: 'arraybuffer', timeout: 25000 });
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Failed primary generator API fetch. Falling back to alternative lolhuman Brat API endpoint');
      // If primary domain fails (like DNS ENOTFOUND for fastrestapis), fallback to a reliable stable endpoint
      const fallbackUrl = `https://api.lolhuman.xyz/api/brat?apikey=free&text=${encodedText}`;
      response = await axios.get(fallbackUrl, { responseType: 'arraybuffer', timeout: 25000 });
    }

    const buffer = Buffer.from(response.data);

    // Upload to Meta Cloud Media API
    const mediaId = await uploadWhatsAppMedia(buffer, 'image/webp');
    if (mediaId) {
      logger.info({ mediaId }, 'Sticker buffer successfully uploaded to Meta media storage');
      return await sendWhatsAppSticker(to, mediaId, true);
    }

    // Last resort fallback
    logger.warn('Meta media upload failed, falling back to direct URL link delivery');
    return await sendWhatsAppSticker(to, stickerUrl, false);
  } catch (error: any) {
    logger.error({ error: error.message, type, text }, 'Failed to generate and upload WhatsApp sticker');
    return false;
  }
}
