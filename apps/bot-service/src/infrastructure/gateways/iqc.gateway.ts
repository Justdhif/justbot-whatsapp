import { generateIQC } from 'iqc-canvas';

/**
 * Generates an iPhone-style WhatsApp chat screenshot buffer using iqc-canvas.
 * @param text The chat message content
 * @param time The time string to show in status bar / message (e.g. "09:41")
 */
export async function generateIqcScreenshot(text: string, time: string): Promise<Buffer> {
  return await generateIQC(text, time, {
    baterai: [true, '100'],
    operator: true,
    timebar: true,
    wifi: true,
  });
}
