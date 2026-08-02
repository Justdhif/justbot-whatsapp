import { sendWhatsAppImage } from '../../infrastructure/gateways/whatsapp.gateway.js';
import { getHelpMenu } from '../../core/use-cases/utilities.use-case.js';

export async function handleMenuCommand(
  from: string,
  userText: string,
  senderName: string
): Promise<boolean> {
  const lower = userText.trim().toLowerCase();

  if (lower === ".menu") {
    const menuText = getHelpMenu(senderName);
    const botAvatarBanner = "https://picsum.photos/800/600";
    await sendWhatsAppImage(from, botAvatarBanner, menuText);
    return true;
  }

  return false;
}
