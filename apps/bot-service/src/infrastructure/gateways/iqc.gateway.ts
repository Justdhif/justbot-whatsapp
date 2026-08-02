import { generateIQC } from 'iqc-canvas';


export async function generateIqcScreenshot(text: string, time: string): Promise<Buffer> {
  return await generateIQC(text, time, {
    baterai: [true, '100'],
    operator: true,
    timebar: true,
    wifi: true,
  });
}
