import { sendWhatsAppMessage } from '../../infrastructure/gateways/whatsapp.gateway.js';
import { getHelpMenu } from '../../core/use-cases/utilities.use-case.js';
import { getUserSession } from '../../infrastructure/store/session.store.js';
import { resolveAccessToken, apiGetBotConfiguration } from '../../infrastructure/gateways/api-client.gateway.js';

export async function handleMenuCommand(
  from: string,
  userText: string,
  senderName: string
): Promise<boolean> {
  const lower = userText.trim().toLowerCase();

  if (lower === ".menu") {
    // Proactively resolve access token to sync displayName to session if registered
    await resolveAccessToken(from).catch(() => null);
    
    // Fetch dynamic bot configuration (days & hours) from database
    const config = await apiGetBotConfiguration().catch(() => null);
    
    const session = getUserSession(from);
    const menuText = getHelpMenu(senderName, session.displayName ?? undefined, config);
    await sendWhatsAppMessage(from, menuText);
    return true;
  }

  return false;
}
