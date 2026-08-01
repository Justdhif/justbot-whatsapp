import { spawn } from 'node:child_process';
import path from 'node:path';
import { logger } from '../utils/logger.js';

const CANVAS_SIZE = 512;
const PADDING = 24;
const CONTENT_WIDTH = CANVAS_SIZE - PADDING * 2;
const CONTENT_HEIGHT = CANVAS_SIZE - PADDING * 2;
const FONT_PATH = path.resolve(process.cwd(), 'src/assets/BratFont.ttf');
const IMAGE_MAGICK_BIN = process.env.IMAGE_MAGICK_BIN || 'magick';
const FALLBACK_MAGICK_BIN = 'convert';

export type BratMode = 'short' | 'medium' | 'long';

export interface BratLayout {
  mode: BratMode;
  fontSize: number;
  lineHeight: number;
  lines: string[];
  justified: boolean;
  x: number;
  y: number;
  blur: number;
}

function normalizeText(input: string): string {
  return input.replace(/\r\n/g, '\n').trim();
}


function estimateCharWidth(char: string, fontSize: number): number {
  if (char === ' ') return fontSize * 0.28;
  if ('ilI.,:;!|'.includes(char)) return fontSize * 0.24;
  if ('mwMW@#%&'.includes(char)) return fontSize * 0.82;
  if ('ABCDEFGHKNOPQRSUVXYZ'.includes(char)) return fontSize * 0.68;
  if ('0123456789'.includes(char)) return fontSize * 0.56;
  return fontSize * 0.50;
}

function estimateTextWidth(text: string, fontSize: number): number {
  return [...text].reduce((sum, char) => sum + estimateCharWidth(char, fontSize), 0);
}

function wrapWords(text: string, fontSize: number, maxWidth: number): string[] {
  const explicitLines = text.split('\n');
  const result: string[] = [];

  for (const explicitLine of explicitLines) {
    const words = explicitLine.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      result.push('');
      continue;
    }

    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (!current || estimateTextWidth(candidate, fontSize) <= maxWidth) {
        current = candidate;
      } else {
        result.push(current);
        current = word;
      }
    }

    if (current) result.push(current);
  }

  return result;
}

function classifyText(text: string): BratMode {
  const words = text.split(/\s+/).filter(Boolean);
  const chars = [...text.replace(/\s/g, '')].length;
  const explicitLines = text.split('\n').length;

  if (explicitLines > 1 || words.length >= 9 || chars >= 58) return 'long';
  if (words.length >= 3 || chars >= 18) return 'medium';
  return 'short';
}

function buildLayout(input: string): BratLayout {
  const text = normalizeText(input);
  const mode = classifyText(text);

  if (mode === 'short') {
    let fontSize = 96;
    while (fontSize > 52 && estimateTextWidth(text, fontSize) > CONTENT_WIDTH) {
      fontSize -= 2;
    }

    return {
      mode,
      fontSize,
      lineHeight: 1,
      lines: [text],
      justified: false,
      x: PADDING,
      y: PADDING + fontSize * 0.84,
      blur: Math.min(2.5, Math.max(1.5, fontSize / 38)),
    };
  }

  if (mode === 'medium') {
    let fontSize = 78;
    let maxWidth = 380;
    let lines = wrapWords(text, fontSize, maxWidth);

    while (
      fontSize > 50 &&
      (lines.length > 5 || lines.length * fontSize * 1.02 > CONTENT_HEIGHT)
    ) {
      fontSize -= 2;
      maxWidth = Math.min(400, maxWidth + 2);
      lines = wrapWords(text, fontSize, maxWidth);
    }

    return {
      mode,
      fontSize,
      lineHeight: 1,
      lines,
      justified: false,
      x: PADDING,
      y: PADDING + fontSize * 0.84,
      blur: Math.min(2.6, Math.max(1.5, fontSize / 38)),
    };
  }

  let fontSize = 52;
  let lines = wrapWords(text, fontSize, CONTENT_WIDTH);

  while (
    fontSize > 38 &&
    (lines.length * fontSize * 1.02 > CONTENT_HEIGHT ||
      lines.some((line) => estimateTextWidth(line, fontSize) > CONTENT_WIDTH))
  ) {
    fontSize -= 2;
    lines = wrapWords(text, fontSize, CONTENT_WIDTH);
  }

  return {
    mode,
    fontSize,
    lineHeight: 1.02,
    lines,
    justified: true,
    x: PADDING,
    y: PADDING + fontSize * 0.84,
    blur: Math.min(2.5, Math.max(1.4, fontSize / 42)),
  };
}

function shellEscapeForMagick(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function buildMagickArgs(layout: BratLayout): string[] {
  const args: string[] = [
    '-size', `${CANVAS_SIZE}x${CANVAS_SIZE}`,
    'xc:white',
    '(',
    '-size', `${CANVAS_SIZE}x${CANVAS_SIZE}`,
    'xc:transparent',
    '-font', FONT_PATH,
    '-pointsize', String(layout.fontSize),
    '-fill', '#000000',
  ];

  const lineHeightPx = layout.fontSize * layout.lineHeight;

  layout.lines.forEach((line, index) => {
    const y = Math.round(layout.y + index * lineHeightPx);
    if (!line.trim()) return;

    if (layout.justified && index < layout.lines.length - 1) {
      const words = line.split(/\s+/).filter(Boolean);
      const metricFactor = 1.15;
      const naturalWidth = estimateTextWidth(line, layout.fontSize) * metricFactor;
      const extraSpace = Math.max(0, CONTENT_WIDTH - naturalWidth);
      const spaces = Math.max(1, words.length - 1);
      const extraWordSpacing = Math.max(8, extraSpace / spaces);

      let x = layout.x;
      for (const word of words) {
        args.push('-annotate', `+${Math.round(x)}+${y}`, shellEscapeForMagick(word));
        x += estimateTextWidth(word, layout.fontSize) * metricFactor + extraWordSpacing;
      }
    } else {
      args.push(
        '-annotate',
        `+${layout.x}+${y}`,
        shellEscapeForMagick(line),
      );
    }
  });

  args.push(
    '-blur', `0x${layout.blur.toFixed(2)}`,
    ')',
    '-compose', 'over',
    '-composite',
    '-quality', '85',
    'webp:-',
  );

  return args;
}

function runImageMagick(args: string[]): Promise<Buffer> {
  const run = (binary: string, allowFallback: boolean): Promise<Buffer> =>
    new Promise((resolve, reject) => {
      const child = spawn(binary, args, {
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const stdout: Buffer[] = [];
      const stderr: Buffer[] = [];

      child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
      child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));

      child.once('error', (error: NodeJS.ErrnoException) => {
        if (allowFallback && error.code === 'ENOENT' && binary === IMAGE_MAGICK_BIN) {
          run(FALLBACK_MAGICK_BIN, false).then(resolve).catch(reject);
          return;
        }

        reject(
          new Error(
            `ImageMagick executable "${binary}" could not be started. ` +
              `Install ImageMagick or set IMAGE_MAGICK_BIN. ${error.message}`,
          ),
        );
      });

      child.once('close', (code) => {
        if (code !== 0) {
          reject(new Error(`ImageMagick failed with code ${code}: ${Buffer.concat(stderr).toString('utf8')}`));
          return;
        }

        const output = Buffer.concat(stdout);
        if (!output.length) {
          reject(new Error('ImageMagick returned an empty sticker image.'));
          return;
        }

        resolve(output);
      });
    });

  return run(IMAGE_MAGICK_BIN, true);
}

export function getBratLayout(input: string): BratLayout {
  const normalized = normalizeText(input);
  if (!normalized) throw new Error('Brat text cannot be empty');
  return buildLayout(normalized);
}

export async function generateBratSticker(input: string): Promise<Buffer> {
  const layout = getBratLayout(input);
  const buffer = await runImageMagick(buildMagickArgs(layout));

  logger.info(
    {
      mode: layout.mode,
      fontSize: layout.fontSize,
      lines: layout.lines.length,
      bytes: buffer.length,
    },
    'Generated Brat-style sticker',
  );

  return buffer;
}
