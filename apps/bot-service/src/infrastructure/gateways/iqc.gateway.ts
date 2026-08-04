import { generateIQC } from 'iqc-canvas';
import sharp from 'sharp';

export async function generateIqcScreenshot(text: string, time: string, imageBuffer?: Buffer): Promise<Buffer> {
  try {
    let processedSticker: Buffer | undefined;

    if (imageBuffer) {
      
      processedSticker = await sharp(imageBuffer)
        .resize(512, 512, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toBuffer();
    }

    const result = await generateIQC(text, time, {
      baterai: [true, '100'],
      operator: true,
      timebar: true,
      wifi: true,
      sticker: processedSticker,
    });
    
    const pngBuffer = (result as any).image;
    if (!pngBuffer) {
      throw new Error('Canvas generation returned invalid object structure');
    }
    
    
    return await sharp(pngBuffer)
      .jpeg({ quality: 95 })
      .toBuffer();
  } catch (error: any) {
    console.error('[GENERATE IQC FAIL]', error);
    throw error;
  }
}
