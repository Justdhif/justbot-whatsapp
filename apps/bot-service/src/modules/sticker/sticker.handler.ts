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

const STICKER_FONT_FAMILY = 'Arial Black, Arial, sans-serif';

const CHARACTER_WIDTHS: Record<string, number> = {
  A: 0.667, B: 0.667, C: 0.722, D: 0.722, E: 0.667, F: 0.611, G: 0.778, H: 0.722, I: 0.278, J: 0.5,
  K: 0.667, L: 0.556, M: 0.833, N: 0.722, O: 0.778, P: 0.667, Q: 0.778, R: 0.722, S: 0.667, T: 0.611,
  U: 0.722, V: 0.667, W: 0.944, X: 0.667, Y: 0.667, Z: 0.611,
  a: 0.556, b: 0.556, c: 0.5,   d: 0.556, e: 0.556, f: 0.278, g: 0.556, h: 0.556, i: 0.222, j: 0.222,
  k: 0.5,   l: 0.222, m: 0.833, n: 0.556, o: 0.556, p: 0.556, q: 0.556, r: 0.333, s: 0.5,   t: 0.278,
  u: 0.556, v: 0.5,   w: 0.722, x: 0.5,   y: 0.5,   z: 0.5,
  '0': 0.556, '1': 0.556, '2': 0.556, '3': 0.556, '4': 0.556, '5': 0.556, '6': 0.556, '7': 0.556, '8': 0.556, '9': 0.556,
  ' ': 0.278, '.': 0.278, ',': 0.278, ';': 0.278, ':': 0.278, '!': 0.278, '?': 0.556,
  '-': 0.333, '_': 0.556, '+': 0.584, '=': 0.584, '/': 0.278, '\\': 0.278, '|': 0.278,
  '(': 0.333, ')': 0.333, '[': 0.278, ']': 0.278, '{': 0.333, '}': 0.333,
  '"': 0.355, "'": 0.191, '`': 0.333, '@': 1.012, '#': 0.556, '$': 0.556, '%': 0.889, '^': 0.469,
  '&': 0.667, '*': 0.389
};

function getCharWidth(char: string): number {
  return CHARACTER_WIDTHS[char] !== undefined ? CHARACTER_WIDTHS[char] : 0.5;
}

function getWordWidth(word: string, fontSize: number): number {
  let width = 0;
  for (let i = 0; i < word.length; i++) {
    width += getCharWidth(word[i]) * fontSize;
  }
  // Scaling down since Arial Narrow is about 82% of standard Arial width
  return width * 0.82;
}

function wrapText(text: string, fontSize: number, maxWidth: number): string[][] {
  const paragraphs = text.split(/\r?\n/);
  const allLines: string[][] = [];

  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      allLines.push([]);
      continue;
    }

    let currentLine: string[] = [];
    let currentLineWidth = 0;
    const spaceWidth = 0.278 * fontSize * 0.82; // Space is also scaled

    for (const word of words) {
      const wordWidth = getWordWidth(word, fontSize);
      if (currentLine.length === 0) {
        currentLine.push(word);
        currentLineWidth = wordWidth;
      } else {
        const candidateWidth = currentLineWidth + spaceWidth + wordWidth;
        if (candidateWidth <= maxWidth) {
          currentLine.push(word);
          currentLineWidth = candidateWidth;
        } else {
          allLines.push(currentLine);
          currentLine = [word];
          currentLineWidth = wordWidth;
        }
      }
    }
    if (currentLine.length > 0) {
      allLines.push(currentLine);
    }
  }

  return allLines;
}

type TextCondition = 'SHORT' | 'MEDIUM' | 'LONG';

function classifyText(text: string): TextCondition {
  const words = text.split(/\s+/).filter(Boolean);
  const linesAtLargeSize = wrapText(text, 52, 452); // 452 is 512 - 30 - 30
  
  if (linesAtLargeSize.length === 1) {
    return 'SHORT';
  }
  
  if (text.length >= 45) {
    return 'LONG';
  }
  
  return 'MEDIUM';
}

function determineLayout(text: string, condition: TextCondition) {
  const maxWidth = 512 - 30 - 30; // 452px
  const maxHeight = 512 - 30 - 30; // 452px
  
  let fontSize = (condition === 'SHORT' || condition === 'MEDIUM') ? 52 : 44;
  let lines: string[][] = [];
  let totalHeight = 0;
  
  while (fontSize >= 16) {
    lines = wrapText(text, fontSize, maxWidth);
    const lineHeight = fontSize * 1.25;
    totalHeight = lines.length * lineHeight;
    
    if (totalHeight <= maxHeight || fontSize === 16) {
      break;
    }
    fontSize -= 1;
  }
  
  return { fontSize, lines, totalHeight };
}

async function createLocalBratSticker(text: string, type: StickerCommandType): Promise<Buffer> {
  const condition = classifyText(text);
  const { fontSize, lines } = determineLayout(text, condition);
  
  const width = 512;
  const height = 512;
  const paddingLeft = 30;
  const paddingTop = 30;
  const maxWidth = width - paddingLeft * 2;
  const lineHeight = fontSize * 1.25;
  
  const textElements: string[] = [];
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    if (line.length === 0) continue;
    
    const y = paddingTop + fontSize + lineIndex * lineHeight;
    const shouldJustify = condition === 'LONG' && lineIndex < lines.length - 1 && line.length > 1;
    
    if (shouldJustify) {
      let totalWordsWidth = 0;
      for (const word of line) {
        totalWordsWidth += getWordWidth(word, fontSize);
      }
      const remainingSpace = maxWidth - totalWordsWidth;
      const spaceWidth = remainingSpace / (line.length - 1);
      
      let x = paddingLeft;
      const tspans: string[] = [];
      for (const word of line) {
        tspans.push(`<tspan x="${x.toFixed(2)}">${escapeXml(word)}</tspan>`);
        x += getWordWidth(word, fontSize) + spaceWidth;
      }
      
      textElements.push(
        `  <text y="${y.toFixed(2)}" font-family="${STICKER_FONT_FAMILY}" font-size="${fontSize}" font-weight="900" fill="#000000" filter="url(#blur)">${tspans.join('')}</text>`
      );
    } else {
      const lineStr = line.join(' ');
      textElements.push(
        `  <text x="${paddingLeft}" y="${y.toFixed(2)}" font-family="${STICKER_FONT_FAMILY}" font-size="${fontSize}" font-weight="900" fill="#000000" filter="url(#blur)">${escapeXml(lineStr)}</text>`
      );
    }
  }
  
  const svgNamespace = 'http://www.w3.org/2000/svg';

  const svg = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="${svgNamespace}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    '  <defs>',
    '    <filter id="blur" x="-10%" y="-10%" width="120%" height="120%">',
    '      <feGaussianBlur stdDeviation="1.3" />',
    '    </filter>',
    '  </defs>',
    '  <rect width="100%" height="100%" fill="#FFFFFF" />',
    ...textElements,
    '</svg>',
  ].join('\n');

  return await sharp(Buffer.from(svg, 'utf8')).webp({ quality: 92 }).toBuffer();
}