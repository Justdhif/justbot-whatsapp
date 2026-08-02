import { sendWhatsAppButtons } from '../infrastructure/gateways/whatsapp.gateway.js';
import { setUserActiveMode } from '../infrastructure/store/session.store.js';
import { handleCuanBuddyCommand } from './commands/cuanbuddy.js';
import { handleMenuCommand } from './commands/menu.js';
import { handleHelpCommand } from './commands/help.js';
import { handleStickerCommand } from './commands/sticker.js';

export async function handleWebhookActionOrMessage(
  from: string,
  userText: string,
  senderName: string,
  session: any
): Promise<boolean> {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();

  // 1. Action: Exit Active Mode Session
  if (lower === "action:exit" || lower === ".exit") {
    setUserActiveMode(from, null);
    const exitText = `🔴 *MODE DIMATIKAN*\n══════════════════════════════\nAnda telah keluar dari mode khusus. Silakan obrolkan apa saja atau ketik \`.menu\` untuk memilih modul baru.`;
    const exitButtons = [{ id: ".menu", title: "📋 Buka Menu" }];
    await sendWhatsAppButtons(from, exitText, exitButtons, "🤖 MODE OFF");
    return true;
  }

  // 2. Delegate to CuanBuddy Commands Handlers
  const isCuanBuddyHandled = await handleCuanBuddyCommand(from, userText, senderName);
  if (isCuanBuddyHandled) {
    return true;
  }

  // 3. Delegate to Menu Command Handler
  const isMenuHandled = await handleMenuCommand(from, userText, senderName);
  if (isMenuHandled) {
    return true;
  }

  // 4. Delegate to Help Command Handler
  const isHelpHandled = await handleHelpCommand(from, userText);
  if (isHelpHandled) {
    return true;
  }

  // 5. Delegate to Sticker & Brat Command Handlers
  const isStickerHandled = await handleStickerCommand(from, userText, session);
  if (isStickerHandled) {
    return true;
  }

  return false;
}
