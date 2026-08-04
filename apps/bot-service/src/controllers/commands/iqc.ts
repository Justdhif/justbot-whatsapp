import { sendWhatsAppMessage, sendWhatsAppImageFromBuffer, downloadWhatsAppMedia } from '../../infrastructure/gateways/whatsapp.gateway.js';
import { generateIqcScreenshot } from '../../infrastructure/gateways/iqc.gateway.js';
import { clearUserLastImage } from '../../infrastructure/store/session.store.js';

export async function handleIqcCommand(
  from: string,
  userText: string,
  session?: any
): Promise<boolean> {
  const trimmed = userText.trim();
  
  
  const iqcMatch = trimmed.match(/^\.iqc$/i);
  if (iqcMatch) {
    const textContent = '';
    
    
    const lastImageMediaId = session?.lastImageMediaId;

    if (!lastImageMediaId) {
      await sendWhatsAppMessage(from, 'Kirim foto terlebih dahulu lalu ketik/caption `.iqc` untuk membuat screenshot chat berisi gambar.');
      return true;
    }

    await sendWhatsAppMessage(from, '⏳ Sedang membuat screenshot chat iPhone...');

    try {
      
      const now = new Date();
      
      const timeStr = now.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace('.', ':');

      let uploadedImageBuffer: Buffer | undefined;

      if (lastImageMediaId) {
        const media = await downloadWhatsAppMedia(lastImageMediaId);
        if (media?.buffer) {
          uploadedImageBuffer = media.buffer;
        }
      }

      const imageBuffer = await generateIqcScreenshot(textContent, timeStr, uploadedImageBuffer);
      
      
      const imageSent = await sendWhatsAppImageFromBuffer(from, imageBuffer, textContent ? `📱 Screenshot chat iPhone: "${textContent}"` : '📱 Screenshot chat iPhone');
      if (!imageSent) {
        await sendWhatsAppMessage(from, 'Gagal mengirim screenshot chat iPhone. Coba lagi beberapa saat.');
      } else {
        if (lastImageMediaId) {
          clearUserLastImage(from);
        }
      }
    } catch (error: any) {
      console.error('[IQC ERROR]', error);
      await sendWhatsAppMessage(from, `Terjadi kesalahan saat memproses screenshot chat iPhone: ${error.message || error}`);
    }
    return true;
  }

  return false;
}
