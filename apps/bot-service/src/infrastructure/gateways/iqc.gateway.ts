import { generateIQC } from 'iqc-canvas';


export async function generateIqcScreenshot(text: string, time: string): Promise<Buffer> {
  try {
    return await generateIQC(text, time, {
      baterai: [true, '100'],
      operator: true,
      timebar: true,
      wifi: true,
    });
  } catch (error: any) {
    console.error('[GENERATE IQC FAIL]', error);
    throw error;
  }
}
