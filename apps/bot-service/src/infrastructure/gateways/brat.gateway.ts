import path from 'node:path';
import sharp from 'sharp';
import { bratGen } from 'brat-canvas';
import { bratVid } from 'brat-canvas/video';
import { logger } from '../../utils/logger.js';

const BRAT_FONT_PATH = path.resolve(process.cwd(), 'src/assets/BratFont.ttf');

function normalizeBratText(input: string): string {
  return input.replace(/\r\n/g, '\n').trim();
}

export async function generateBratSticker(input: string): Promise<Buffer> {
  const text = normalizeBratText(input);

  if (!text) {
    throw new Error('Brat text cannot be empty');
  }

  const bratPngBuffer = await bratGen(text, {
    theme: 'white',
    fontPaths: [BRAT_FONT_PATH],
  });

  const bratWebpBuffer = await sharp(bratPngBuffer)
    .resize(512, 512, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 95 })
    .toBuffer();

  logger.info(
    {
      bytes: bratWebpBuffer.length,
    },
    'Generated Brat sticker buffer',
  );

  return bratWebpBuffer;
}

export async function generateBratVideoSticker(input: string): Promise<Buffer> {
  const text = normalizeBratText(input);

  if (!text) {
    throw new Error('Brat text cannot be empty');
  }

  const bratGifBuffer = await bratVid(text, {
    outputFormat: 'gif',
    theme: 'white',
    brat: {
      fontPaths: [BRAT_FONT_PATH],
    },
    lyric: {
      frameDuration: 0.45,
      lastFrameDuration: 0.9,
      maxWordPerLayer: 5,
    },
  });

  const bratWebpBuffer = await sharp(bratGifBuffer, { animated: true })
    .resize(512, 512, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 90 })
    .toBuffer();

  logger.info(
    {
      bytes: bratWebpBuffer.length,
    },
    'Generated animated Brat sticker buffer',
  );

  return bratWebpBuffer;
}