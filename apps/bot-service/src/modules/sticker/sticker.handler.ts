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
  const width = 512;
  const height = 512;
  const svgNamespace = 'http:' + String.fromCharCode(47, 47) + 'www.w3.org/2000/svg';
  const textSvg = buildBlockTextSvg(lines, theme.textColor, width, height);

  const svg = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="' + svgNamespace + '" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">',
    '  <rect width="100%" height="100%" fill="' + theme.background + '" />',
    '  <rect x="20" y="20" width="472" height="472" rx="36" ry="36" fill="none" stroke="' + theme.accent + '" stroke-width="5" opacity="0.22" />',
    textSvg,
    '</svg>',
  ].join('\n');

  return await sharp(Buffer.from(svg, 'utf8')).webp({ quality: 92 }).toBuffer();
}

type BlockGlyph = string[];

const BLOCK_FONT: Record<string, BlockGlyph> = {
  A: ['  #  ', ' # # ', '#   #', '#####', '#   #', '#   #', '#   #'],
  B: ['#### ', '#   #', '#   #', '#### ', '#   #', '#   #', '#### '],
  C: [' ####', '#    ', '#    ', '#    ', '#    ', '#    ', ' ####'],
  D: ['#### ', '#   #', '#   #', '#   #', '#   #', '#   #', '#### '],
  E: ['#####', '#    ', '#    ', '#####', '#    ', '#    ', '#####'],
  F: ['#####', '#    ', '#    ', '#####', '#    ', '#    ', '#    '],
  G: [' ####', '#    ', '#    ', '#  ##', '#   #', '#   #', ' ####'],
  H: ['#   #', '#   #', '#   #', '#####', '#   #', '#   #', '#   #'],
  I: ['#####', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '#####'],
  J: ['#####', '   # ', '   # ', '   # ', '#  # ', '#  # ', ' ##  '],
  K: ['#   #', '#  # ', '# #  ', '##   ', '# #  ', '#  # ', '#   #'],
  L: ['#    ', '#    ', '#    ', '#    ', '#    ', '#    ', '#####'],
  M: ['#   #', '## ##', '# # #', '#   #', '#   #', '#   #', '#   #'],
  N: ['#   #', '##  #', '# # #', '#  ##', '#   #', '#   #', '#   #'],
  O: [' ### ', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
  P: ['#### ', '#   #', '#   #', '#### ', '#    ', '#    ', '#    '],
  Q: [' ### ', '#   #', '#   #', '#   #', '# # #', '#  # ', ' ## #'],
  R: ['#### ', '#   #', '#   #', '#### ', '# #  ', '#  # ', '#   #'],
  S: [' ####', '#    ', '#    ', ' ### ', '    #', '    #', '#### '],
  T: ['#####', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  '],
  U: ['#   #', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
  V: ['#   #', '#   #', '#   #', '#   #', ' # # ', ' # # ', '  #  '],
  W: ['#   #', '#   #', '#   #', '# # #', '# # #', '## ##', '#   #'],
  X: ['#   #', ' # # ', '  #  ', '  #  ', '  #  ', ' # # ', '#   #'],
  Y: ['#   #', ' # # ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  '],
  Z: ['#####', '   # ', '  #  ', ' #   ', '#    ', '#    ', '#####'],
  '0': [' ### ', '#   #', '#  ##', '# # #', '##  #', '#   #', ' ### '],
  '1': ['  #  ', ' ##  ', '# #  ', '  #  ', '  #  ', '  #  ', '#####'],
  '2': [' ### ', '#   #', '    #', '   # ', '  #  ', ' #   ', '#####'],
  '3': [' ### ', '#   #', '    #', ' ### ', '    #', '#   #', ' ### '],
  '4': ['   # ', '  ## ', ' # # ', '#  # ', '#####', '   # ', '   # '],
  '5': ['#####', '#    ', '#    ', '#### ', '    #', '#   #', ' ### '],
  '6': [' ### ', '#   #', '#    ', '#### ', '#   #', '#   #', ' ### '],
  '7': ['#####', '    #', '   # ', '  #  ', '  #  ', '  #  ', '  #  '],
  '8': [' ### ', '#   #', '#   #', ' ### ', '#   #', '#   #', ' ### '],
  '9': [' ### ', '#   #', '#   #', ' ####', '    #', '#   #', ' ### '],
  ' ': ['     ', '     ', '     ', '     ', '     ', '     ', '     '],
  '.': ['     ', '     ', '     ', '     ', '     ', ' ##  ', ' ##  '],
  '!': ['  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '     ', '  #  '],
  '?': [' ### ', '#   #', '    #', '   # ', '  #  ', '     ', '  #  '],
  '-': ['     ', '     ', '     ', '#####', '     ', '     ', '     '],
};

function buildBlockTextSvg(lines: string[], color: string, width: number, height: number): string {
  const charWidth = 5;
  const charHeight = 7;
  const pixelsPerCell = 18;
  const letterSpacing = 4;
  const lineSpacing = 16;
  const wrapped = lines.length > 0 ? lines : [''];

  const renderedLines = wrapped.map((line) => {
    const cells = Array.from(line).map((character) => BLOCK_FONT[character] || BLOCK_FONT['?']);
    const lineWidth = cells.length * (charWidth * pixelsPerCell + letterSpacing) - letterSpacing;
    return { cells, lineWidth };
  });

  const totalHeight = renderedLines.length * (charHeight * pixelsPerCell + lineSpacing) - lineSpacing;
  const topOffset = Math.max(0, Math.round((height - totalHeight) / 2));

  const rects: string[] = [];

  for (let lineIndex = 0; lineIndex < renderedLines.length; lineIndex += 1) {
    const { cells, lineWidth } = renderedLines[lineIndex];
    const leftOffset = Math.max(0, Math.round((width - lineWidth) / 2));
    const baseY = topOffset + lineIndex * (charHeight * pixelsPerCell + lineSpacing);

    for (let charIndex = 0; charIndex < cells.length; charIndex += 1) {
      const glyph = cells[charIndex];
      const baseX = leftOffset + charIndex * (charWidth * pixelsPerCell + letterSpacing);

      for (let row = 0; row < glyph.length; row += 1) {
        const rowText = glyph[row];
        for (let col = 0; col < rowText.length; col += 1) {
          if (rowText[col] !== '#') {
            continue;
          }

          rects.push(
            `<rect x="${baseX + col * pixelsPerCell}" y="${baseY + row * pixelsPerCell}" width="${pixelsPerCell}" height="${pixelsPerCell}" fill="${color}" rx="4" ry="4" />`,
          );
        }
      }
    }
  }

  return `<g>${rects.join('')}</g>`;
}