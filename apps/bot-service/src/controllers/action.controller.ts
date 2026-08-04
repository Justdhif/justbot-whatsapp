import { sendWhatsAppButtons } from '../infrastructure/gateways/whatsapp.gateway.js';
import { setUserActiveMode } from '../infrastructure/store/session.store.js';
import { handleMenuCommand } from './commands/menu.js';
import { handleStickerCommand } from './commands/sticker.js';
import { handleIqcCommand } from './commands/iqc.js';
import { handleFinanceCommand } from './commands/finance.js';
import { handleLoginCommand } from './commands/login.js';

export async function handleWebhookActionOrMessage(
  from: string,
  userText: string,
  senderName: string,
  session: any
): Promise<boolean> {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();

  // Login QR commands — intercept langsung
  if (lower.startsWith('.login ')) {
    const isHandled = await handleLoginCommand(from, userText);
    if (isHandled) return true;
  }

  // ── Intercept: Pending Action ────────────────────────────────────────────
  // Jika user sedang dalam conversation flow (misal: menunggu input nama register),
  // langsung teruskan ke handler yang relevan tanpa melalui perintah lain.
  if (session.pendingAction?.startsWith('awaiting:register:')) {
    return handleFinanceCommand(from, userText, senderName);
  }

  if (lower === "action:exit" || lower === ".exit") {
    setUserActiveMode(from, null);
    const exitText = `🔴 *MODE DIMATIKAN*\n══════════════════════════════\nAnda telah keluar dari mode khusus. Silakan obrolkan apa saja atau ketik \`.menu\` untuk memilih modul baru.`;
    const exitButtons = [{ id: ".menu", title: "📋 Buka Menu" }];
    await sendWhatsAppButtons(from, exitText, exitButtons, "🤖 MODE OFF");
    return true;
  }

  // Finance commands — selalu dicek (baik dalam mode finance maupun tidak)
  const isFinanceCommand =
    lower === '.finance' ||
    lower === '.keuangan' ||
    lower.startsWith('.catat ') ||
    lower === '.riwayat' ||
    lower === '.riwayat masuk' ||
    lower === '.riwayat keluar' ||
    lower === '.laporan' ||
    lower === '.summary' ||
    lower.startsWith('.hapus ');

  if (isFinanceCommand) {
    const isHandled = await handleFinanceCommand(from, userText, senderName);
    if (isHandled) return true;
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

