import { sendWhatsAppButtons } from '../infrastructure/gateways/whatsapp.gateway.js';
import { setUserActiveMode } from '../infrastructure/store/session.store.js';
import { handleCuanBuddyCommand } from './commands/cuanbuddy.js';
import { handleMenuCommand } from './commands/menu.js';
import { handleStickerCommand } from './commands/sticker.js';
import { handleIqcCommand } from './commands/iqc.js';

export async function handleWebhookActionOrMessage(
  from: string,
  userText: string,
  senderName: string,
  session: any
): Promise<boolean> {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();

  
  if (lower === "action:exit" || lower === ".exit") {
    setUserActiveMode(from, null);
    const exitText = `🔴 *MODE DIMATIKAN*\n══════════════════════════════\nAnda telah keluar dari mode khusus. Silakan obrolkan apa saja atau ketik \`.menu\` untuk memilih modul baru.`;
    const exitButtons = [{ id: ".menu", title: "📋 Buka Menu" }];
    await sendWhatsAppButtons(from, exitText, exitButtons, "🤖 MODE OFF");
    return true;
  }

  
  const isCuanBuddyHandled = await handleCuanBuddyCommand(from, userText, senderName);
  if (isCuanBuddyHandled) {
    return true;
  }

  
  const isMenuHandled = await handleMenuCommand(from, userText, senderName);
  if (isMenuHandled) {
    return true;
  }



  
  const isStickerHandled = await handleStickerCommand(from, userText, session);
  if (isStickerHandled) {
    return true;
  }

  const isIqcHandled = await handleIqcCommand(from, userText, session);
  if (isIqcHandled) {
    return true;
  }

  return false;
}
