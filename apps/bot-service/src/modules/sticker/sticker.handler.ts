import { sendWhatsAppSticker } from '../../services/whatsapp.service.js';
import { logger } from '../../utils/logger.js';

export async function handleStickerModule(userPrompt: string, to: string): Promise<string> {
  const trimmed = userPrompt.trim();
  const lower = trimmed.toLowerCase();

  // If no prompt text is supplied, tell the user how to use the sticker commands
  if (!trimmed) {
    return `🎨 *STICKER GENERATOR MODULE* 🎨
══════════════════════════════════════

Silakan gunakan perintah khusus berikut untuk membuat stiker secara instan:

1. 🤍 *Stiker Brat Text (Latar Putih)*
   ├─ Perintah: \`.brat <teks>\`
   └─ Contoh: \`.brat au ah bete\`

2. 🎬 *Stiker Brat Animated/Vid (Latar Putih Berkelip)*
   ├─ Perintah: \`.bratvid <teks>\`
   └─ Contoh: \`.bratvid overthinking\`

3. 💬 *Stiker Quick Chat (Bubble Chat)*
   ├─ Perintah: \`.qchat <teks>\`
   └─ Contoh: \`.qchat otw bro\`

4. 🍏 *Stiker iPhone Style Quick Chat*
   ├─ Perintah: \`.qchat-ios <teks>\`
   └─ Contoh: \`.qchat-ios besok yaa\`

══════════════════════════════════════
✨ _Kirimkan teks yang ingin dijadikan stiker dengan format di atas!_`;
  }
  return '';
}

/**
 * High-performance sticker generator endpoint integration
 * We use reliable custom cloud rendering APIs to generate exact high-quality sticker formats
 */
export async function generateAndSendSticker(
  to: string,
  type: 'brat' | 'bratvid' | 'qchat' | 'qchat-ios',
  text: string
): Promise<boolean> {
  try {
    const encodedText = encodeURIComponent(text);
    let stickerUrl = '';

    if (type === 'brat') {
      // High-resolution white background Brat sticker rendering endpoint
      stickerUrl = `https://fastrestapis.fasturl.cloud/creator/brat?text=${encodedText}&background=white`;
    } else if (type === 'bratvid') {
      // High-performance animated text sticker rendering endpoint
      stickerUrl = `https://fastrestapis.fasturl.cloud/creator/brat-gif?text=${encodedText}&background=white`;
    } else if (type === 'qchat') {
      // WhatsApp Android Style Bubble chat sticker
      stickerUrl = `https://api.lolhuman.xyz/api/qc?apikey=free&text=${encodedText}&username=JustBot&avatar=https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe`;
    } else if (type === 'qchat-ios') {
      // WhatsApp iOS iMessage Style Bubble chat sticker
      stickerUrl = `https://api.lolhuman.xyz/api/qc2?apikey=free&text=${encodedText}&username=JustBot&avatar=https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe`;
    }

    logger.info({ type, text, stickerUrl }, 'Generating sticker via cloud rendering API');
    return await sendWhatsAppSticker(to, stickerUrl);
  } catch (error) {
    logger.error({ error, type, text }, 'Failed to generate and send WhatsApp sticker');
    return false;
  }
}
