import sharp from 'sharp';
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

    const stickerBuffer = await createLocalBratSticker(cleanedText, type);
    const mediaId = await uploadWhatsAppMedia(stickerBuffer, 'image/webp');

    if (mediaId) {
      logger.info({ mediaId, type }, 'Sticker buffer successfully uploaded to Meta media storage');
      return await sendWhatsAppSticker(to, mediaId, true);
    }

    logger.warn({ type }, 'Meta media upload failed after local sticker generation');
    return false;
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

function wrapStickerText(text: string, maxLineLength: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return [''];
  }

  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length > maxLineLength && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 6);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getStickerTheme(type: StickerCommandType): { background: string; textColor: string; accent: string } {
  switch (type) {
    case 'brat':
      return { background: '#D8FF00', textColor: '#111111', accent: '#111111' };
    case 'bratvid':
      return { background: '#F4F4F4', textColor: '#111111', accent: '#D8FF00' };
    case 'qchat':
      return { background: '#EAF7FF', textColor: '#0F172A', accent: '#38BDF8' };
    case 'qchat-ios':
      return { background: '#F2F2F7', textColor: '#111111', accent: '#007AFF' };
    default:
      return { background: '#D8FF00', textColor: '#111111', accent: '#111111' };
  }
}

async function createLocalBratSticker(text: string, type: StickerCommandType): Promise<Buffer> {
  const theme = getStickerTheme(type);
  const lines = wrapStickerText(text.toUpperCase(), 11);
  const lineHeight = 78;
  const fontSize = lines.length <= 2 ? 82 : lines.length === 3 ? 72 : 60;
  const width = 512;
  const height = 512;
  const textBlockHeight = lines.length * lineHeight;
  const startY = Math.round((height - textBlockHeight) / 2 + fontSize / 2);

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http:
      <rect width="100%" height="100%" fill="${theme.background}" />
      <rect x="20" y="20" width="472" height="472" rx="36" ry="36" fill="none" stroke="${theme.accent}" stroke-width="5" opacity="0.22" />
      <g fill="${theme.textColor}" font-family="Arial, Helvetica, sans-serif" font-weight="700" text-anchor="middle">
        ${lines
          .map((line, index) => {
            const y = startY + index * lineHeight;
            return `<text x="256" y="${y}" font-size="${fontSize}" letter-spacing="-1">${escapeXml(line)}</text>`;
          })
          .join('\n        ')}
      </g>
    </svg>`;

  return await sharp(Buffer.from(svg)).webp({ quality: 92 }).toBuffer();
}