import { sendWhatsAppMessage, sendWhatsAppImageFromBuffer } from '../../infrastructure/gateways/whatsapp.gateway.js';
import { generateIqcScreenshot } from '../../infrastructure/gateways/iqc.gateway.js';

export async function handleIqcCommand(
  from: string,
  userText: string
): Promise<boolean> {
  const trimmed = userText.trim();
  
  // Trigger pattern: .iqc <teks>
  const iqcMatch = trimmed.match(/^\.iqc(?:\s*[:\s]\s*(.*))?$/i);
  if (iqcMatch) {
    const textContent = (iqcMatch[1] || '').trim();
    if (!textContent) {
      await sendWhatsAppMessage(from, 'Ketik `.iqc teks chat kamu` untuk membuat screenshot chat WhatsApp iPhone.');
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

      const imageBuffer = await generateIqcScreenshot(textContent, timeStr);
      
      // Send the generated chat mockup screenshot directly as an image
      const imageSent = await sendWhatsAppImageFromBuffer(from, imageBuffer, `📱 Screenshot chat iPhone: "${textContent}"`);
      if (!imageSent) {
        await sendWhatsAppMessage(from, 'Gagal mengirim screenshot chat iPhone. Coba lagi beberapa saat.');
      }
    } catch (error) {
      await sendWhatsAppMessage(from, 'Terjadi kesalahan saat memproses screenshot chat iPhone.');
    }
    return true;
  }

  return false;
}
