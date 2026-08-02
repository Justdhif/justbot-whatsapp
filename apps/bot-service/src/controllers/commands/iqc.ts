import { sendWhatsAppMessage, sendWhatsAppImageFromBuffer, downloadWhatsAppMedia } from '../../infrastructure/gateways/whatsapp.gateway.js';
import { generateIqcScreenshot } from '../../infrastructure/gateways/iqc.gateway.js';
import { clearUserLastImage } from '../../infrastructure/store/session.store.js';

export async function handleIqcCommand(
  from: string,
  userText: string,
  session?: any
): Promise<boolean> {
  const trimmed = userText.trim();
  
  // Trigger pattern: .iqc <teks>
  const iqcMatch = trimmed.match(/^\.iqc(?:\s*[:\s]\s*(.*))?$/i);
  if (iqcMatch) {
    const textContent = (iqcMatch[1] || '').trim();
    
    // Check if there is an image to download from the session
    const lastImageMediaId = session?.lastImageMediaId;

    if (!textContent && !lastImageMediaId) {
      await sendWhatsAppMessage(from, 'Ketik `.iqc teks chat kamu` untuk membuat screenshot chat WhatsApp iPhone. Atau kirim foto terlebih dahulu lalu ketik `.iqc` (atau `.iqc caption`) untuk membuat screenshot chat berisi gambar.');
      return true;
    }

    await sendWhatsAppMessage(from, '⏳ Sedang membuat screenshot chat iPhone...');

    try {
      // Get current local time in HH:mm format
      const now = new Date();
      // Adjust timezone to Jakarta (WIB) for mock default
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
      
      // Send the generated chat mockup screenshot directly as an image
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
