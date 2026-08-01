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
 * Uses highly-stable public WebP rendering engines with robust error fallback management.
 */
export async function generateAndSendSticker(
  to: string,
  type: 'brat' | 'bratvid' | 'qchat' | 'qchat-ios',
  text: string
): Promise<boolean> {
  try {
    const encodedText = encodeURIComponent(text);
    const stickerCandidates: string[] = [];

    if (type === 'brat') {
      stickerCandidates.push(
        `https://fastrestapis.fasturl.cloud/creator/brat?text=${encodedText}&background=white`,
        `https://api.lolhuman.xyz/api/brat?apikey=free&text=${encodedText}`,
      );
    } else if (type === 'bratvid') {
      stickerCandidates.push(
        `https://fastrestapis.fasturl.cloud/creator/brat-gif?text=${encodedText}&background=white`,
        `https://api.lolhuman.xyz/api/brat?apikey=free&text=${encodedText}`,
      );
    } else if (type === 'qchat') {
      stickerCandidates.push(
        `https://api.lolhuman.xyz/api/qc?apikey=free&text=${encodedText}&username=JustBot&avatar=https://picsum.photos/200`,
      );
    } else if (type === 'qchat-ios') {
      stickerCandidates.push(
        `https://api.lolhuman.xyz/api/qc2?apikey=free&text=${encodedText}&username=JustBot&avatar=https://picsum.photos/200`,
      );
    }

    const stickerUrl = stickerCandidates[0] || '';

    logger.info({ type, text, stickerUrl }, 'Generating sticker buffer via API');

    // Download WebP buffer directly with fallback support
    let response;
    let lastError: any = null;

    for (let index = 0; index < stickerCandidates.length; index += 1) {
      const candidateUrl = stickerCandidates[index];

      try {
        response = await axios.get(candidateUrl, { responseType: 'arraybuffer', timeout: 25000 });
        logger.info({ candidateUrl }, 'Sticker generator candidate succeeded');
        break;
      } catch (err: any) {
        lastError = err;
        const isLastCandidate = index === stickerCandidates.length - 1;
        logger.warn(
          { err: err.message, candidateUrl },
          isLastCandidate
            ? 'All sticker generator candidates failed.'
            : 'Sticker generator candidate failed. Trying next fallback...'
        );
      }
    }

    if (!response) {
      throw lastError || new Error('No sticker generator candidates succeeded');
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
