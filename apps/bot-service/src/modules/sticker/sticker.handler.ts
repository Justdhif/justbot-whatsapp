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
        // API 1: Aqul Brat Vercel Endpoint (Uses direct text query parameter)
        `https://aqul-brat.vercel.app/api/brat?text=${encodedText}`,
        // API 2: FastRestAPIs Brat Generator
        `https://fastrestapis.fasturl.cloud/creator/brat?text=${encodedText}&background=white`,
        // API 3: Lolhuman Brat Generator fallback
        `https://api.lolhuman.xyz/api/brat?apikey=free&text=${encodedText}`,
      );
    } else if (type === 'bratvid') {
      stickerCandidates.push(
        `https://fastrestapis.fasturl.cloud/creator/brat-gif?text=${encodedText}&background=white`,
        `https://aqul-brat.vercel.app/api/brat?text=${encodedText}`,
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

    // FALLBACK 3: Custom Node-Canvas Generator if all external APIs fail!
    // We dynamic-import canvas to avoid build errors if the target user environment doesn't have native libraries.
    // If not installed, we fallback to our clean error throw.
    if (!response) {
      try {
        // Resolve canvas dynamically via require/import if exists
        const CanvasModule = await import(
          /* webpackIgnore: true */
          // @ts-ignore
          'canvas'
        ).catch(() => null);

        if (CanvasModule && CanvasModule.createCanvas) {
          const canvas = CanvasModule.createCanvas(512, 512);
          const ctx = canvas.getContext('2d');

          // Draw Brat white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 512, 512);

          // Draw bold black centered text
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 64px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const words = text.split(' ');
          let line = '';
          const lines = [];
          const maxWidth = 420;
          const lineHeight = 75;

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
              lines.push(line);
              line = words[n] + ' ';
            } else {
              line = testLine;
            }
          }
          lines.push(line);

          const startY = 256 - ((lines.length - 1) * lineHeight) / 2;
          for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i].trim(), 256, startY + i * lineHeight);
          }

          const canvasBuffer = canvas.toBuffer('image/png');
          const mediaId = await uploadWhatsAppMedia(canvasBuffer, 'image/png');
          if (mediaId) {
            logger.info('Brat sticker successfully generated via local Canvas fallback and uploaded to Meta');
            return await sendWhatsAppSticker(to, mediaId, true);
          }
        }
      } catch (canvasErr: any) {
        logger.error({ canvasErr: canvasErr.message }, 'Canvas fallback generation failed');
      }

      throw lastError || new Error('No candidate url returned a response buffer');
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
