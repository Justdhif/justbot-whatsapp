import { sendWhatsAppButtons } from '../infrastructure/gateways/whatsapp.gateway.js';
import { setUserActiveMode } from '../infrastructure/store/session.store.js';
import { handleMenuCommand } from './commands/menu.js';
import { handleStickerCommand } from './commands/sticker.js';
import { handleIqcCommand } from './commands/iqc.js';
import { handleFinanceCommand } from './commands/finance.js';
import { handleReminderCommand } from './commands/reminder.js';
import { handleLoginCommand } from './commands/login.js';
import { classifyTargetModule } from './commands/general.js';

export async function handleWebhookActionOrMessage(
  from: string,
  userText: string,
  senderName: string,
  session: any
): Promise<boolean> {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();

  if (lower.startsWith('.login ')) {
    const isHandled = await handleLoginCommand(from, userText);
    if (isHandled) return true;
  }

  if (
    session.pendingAction?.startsWith('awaiting:register:') ||
    session.pendingAction?.startsWith('awaiting:catat:') ||
    session.pendingAction?.startsWith('awaiting:edit:') ||
    session.pendingAction?.startsWith('awaiting:delete:')
  ) {
    
    if (session.activeMode === 'reminder') {
      return handleReminderCommand(from, userText, senderName);
    }
    return handleFinanceCommand(from, userText, senderName);
  }

  if (session.pendingAction?.startsWith('awaiting:reminder:')) {
    return handleReminderCommand(from, userText, senderName);
  }

  if (lower === "action:exit" || lower === ".exit") {
    setUserActiveMode(from, null);
    const exitText = `🔴 *MODE DIMATIKAN*\n══════════════════════════════\nAnda telah keluar dari mode khusus. Silakan obrolkan apa saja atau ketik \`.menu\` untuk memilih modul baru.`;
    const exitButtons = [{ id: ".menu", title: "📋 Buka Menu" }];
    await sendWhatsAppButtons(from, exitText, exitButtons, "🤖 MODE OFF");
    return true;
  }

  const isGeneralEditOrDelete = lower.startsWith('.edit ') || lower.startsWith('.hapus ');
  if (isGeneralEditOrDelete) {
    const target = await classifyTargetModule(from, senderName, userText);
    if (target === 'finance') {
      return handleFinanceCommand(from, userText, senderName);
    } else if (target === 'reminder') {
      return handleReminderCommand(from, userText, senderName);
    } else {
      
      const actionType = lower.startsWith('.edit ') ? 'Edit' : 'Hapus';
      const detailText = trimmed.slice(actionType === 'Edit' ? 6 : 7).trim();
      const questionText =
        `❓ *Modul apa yang ingin Anda ${actionType.toLowerCase()}?*\n══════════════════════════════\n` +
        `Kalimat Anda: "_${detailText}_"\n\nPilih modul target di bawah ini 👇`;

      await sendWhatsAppButtons(
        from,
        questionText,
        [
          { id: `.${actionType.toLowerCase()} transaksi ${detailText}`, title: '💰 Transaksi Keuangan' },
          { id: `.${actionType.toLowerCase()} pengingat ${detailText}`, title: '🔔 Pengingat' },
        ],
        '❓ PILIH TARGET MODUL',
      );
      return true;
    }
  }

  const isReminderCommand =
    lower === '.pengingat' ||
    lower === '.reminder' ||
    lower.startsWith('.ingatkan') ||
    lower.startsWith('.hapus-ingat ') ||
    lower.startsWith('.edit-ingat ') ||
    lower === 'reminder:confirm' ||
    lower === 'reminder:cancel';

  if (isReminderCommand) {
    const isHandled = await handleReminderCommand(from, userText, senderName);
    if (isHandled) return true;
  }

  const isFinanceCommand =
    lower === '.finance' ||
    lower === '.keuangan' ||
    lower.startsWith('.catat ') ||
    lower === '.riwayat' ||
    lower === '.riwayat masuk' ||
    lower === '.riwayat keluar' ||
    lower === '.laporan' ||
    lower === '.summary' ||
    lower.startsWith('.hapus ') ||
    lower.startsWith('.edit ') ||
    lower === 'catat:confirm' ||
    lower === 'catat:cancel' ||
    lower === 'edit:confirm' ||
    lower === 'edit:cancel' ||
    lower === 'delete:confirm' ||
    lower === 'delete:cancel' ||
    lower === 'auth:register';

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
