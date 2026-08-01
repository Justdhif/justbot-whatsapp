import axios from 'axios';
import { sendWhatsAppSticker, uploadWhatsAppMedia } from '../../services/whatsapp.service.js';
import { logger } from '../../utils/logger.js';

export type StickerCommandType = 'brat' | 'bratvid' | 'qchat' | 'qchat-ios';

export function parseStickerCommand(text: string): { type: StickerCommandType; text: string } | null {
  const trimmed = text.trim();
  const match = trimmed.match(/^[.!/](bratvid|brat|qchat-ios|qchat)\b\s*(.*)$/i);

  if (!match) {
    return null;
  }

  return {
    type: match[1].toLowerCase() as StickerCommandType,
    text: match[2].trim(),
  };
}

export function getStickerHelpMessage(): string {
  return `🎨 *STICKER GENERATOR* 🎨
══════════════════════════════════════

Gunakan command berikut untuk membuat sticker ala Brat:

1. 🤍 *.brat <teks>*
   └─ Contoh: \.brat au ah bete

2. 🎬 *.bratvid <teks>*
   └─ Contoh: \.bratvid overthinking

3. 💬 *.qchat <teks>*
   └─ Contoh: \.qchat otw bro

4. 🍏 *.qchat-ios <teks>*
   └─ Contoh: \.qchat-ios besok yaa

══════════════════════════════════════
Kirim teks setelah command untuk langsung dibuat jadi sticker.`;
}

export async function generateAndSendSticker(
  to: string,
  type: StickerCommandType,
  text: string,
): Promise<boolean> {
  try {
    const cleanedText = text.trim();

    if (!cleanedText) {
      return false;
    }

    const encodedText = encodeURIComponent(cleanedText);
    const stickerCandidates: string[] = [];

    if (type === 'brat') {
      stickerCandidates.push(
        `https://aqul-brat.vercel.app/api/brat?text=${encodedText}`,
        `https://fastrestapis.fasturl.cloud/creator/brat?text=${encodedText}&background=white`,
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

    let response: any = null;
    let lastError: unknown = null;

    for (const candidateUrl of stickerCandidates) {
      try {
        response = await axios.get(candidateUrl, {
          responseType: 'arraybuffer',
          timeout: 25000,
        });
        logger.info({ candidateUrl, type }, 'Sticker generator candidate succeeded');
        break;
      } catch (error) {
        lastError = error;
        logger.warn(
          { candidateUrl, error: error instanceof Error ? error.message : error },
          'Sticker generator candidate failed. Trying next fallback...',
        );
      }
    }

    if (!response) {
      throw lastError instanceof Error ? lastError : new Error('No sticker generator candidate returned a response.');
    }

    const buffer = Buffer.from(response.data as ArrayBuffer);
    const mediaId = await uploadWhatsAppMedia(buffer, 'image/webp');

    if (mediaId) {
      logger.info({ mediaId, type }, 'Sticker buffer successfully uploaded to Meta media storage');
      return await sendWhatsAppSticker(to, mediaId, true);
    }

    const fallbackStickerUrl = stickerCandidates[0];
    logger.warn({ type, fallbackStickerUrl }, 'Meta media upload failed, falling back to direct URL sticker delivery');
    return await sendWhatsAppSticker(to, fallbackStickerUrl, false);
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : error,
        type,
        text,
      },
      'Failed to generate and upload WhatsApp sticker',
    );
    return false;
  }
}