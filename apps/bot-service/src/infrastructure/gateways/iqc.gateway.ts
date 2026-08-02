import { generateIQC } from 'iqc-canvas';
import sharp from 'sharp';

export async function generateIqcScreenshot(text: string, time: string): Promise<Buffer> {
  try {
    const pngBuffer = await generateIQC(text, time, {
      baterai: [true, '100'],
      operator: true,
      timebar: true,
      wifi: true,
    });
    
    // Explicitly convert PNG from generateIQC to JPEG format using sharp to match image/jpeg upload mimetype
    return await sharp(pngBuffer)
      .jpeg({ quality: 95 })
      .toBuffer();
  } catch (error: any) {
    console.error('[GENERATE IQC FAIL]', error);
    throw error;
  }
}
