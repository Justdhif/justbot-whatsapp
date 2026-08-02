import { generateIQC } from 'iqc-canvas';
import sharp from 'sharp';

export async function generateIqcScreenshot(text: string, time: string, imageBuffer?: Buffer): Promise<Buffer> {
  try {
    const result = await generateIQC(text, time, {
      baterai: [true, '100'],
      operator: true,
      timebar: true,
      wifi: true,
      sticker: imageBuffer || undefined,
    });
    
    const pngBuffer = (result as any).image;
    if (!pngBuffer) {
      throw new Error('Canvas generation returned invalid object structure');
    }
    
    // Explicitly convert PNG from generateIQC to JPEG format using sharp to match image/jpeg upload mimetype
    return await sharp(pngBuffer)
      .jpeg({ quality: 95 })
      .toBuffer();
  } catch (error: any) {
    console.error('[GENERATE IQC FAIL]', error);
    throw error;
  }
}
