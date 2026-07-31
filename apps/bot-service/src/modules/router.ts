import { handleFinanceModule } from './finance/finance.handler.js';
import { handleCreatorModule } from './creator/creator.handler.js';
import { handlePdfAiModule } from './pdf-ai/pdf-ai.handler.js';
import { handleOcrModule } from './ocr/ocr.handler.js';
import { handleCodingModule } from './coding/coding.handler.js';
import { handleTranslatorModule } from './translator/translator.handler.js';
import { handleWritingModule } from './writing/writing.handler.js';
import { handleAnalyticsModule } from './analytics/analytics.handler.js';
import { handleReminderModule } from './reminder/reminder.handler.js';
import { handleCloudStorageModule } from './cloud-storage/cloud-storage.handler.js';
import { handleEmailModule } from './email/email.handler.js';
import { handleUtilitiesModule, getHelpMenu } from './utilities/utilities.handler.js';
import { askGroqAI } from '../services/groq.service.js';

export async function processIncomingMessage(text: string): Promise<string> {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  if (lower === '!menu' || lower === '/help' || lower === 'help' || lower === 'menu') {
    return getHelpMenu();
  }

  if (lower.startsWith('!finance')) {
    return await handleFinanceModule(trimmed.replace(/^!finance\s*/i, ''));
  }
  if (lower.startsWith('!creator')) {
    return await handleCreatorModule(trimmed.replace(/^!creator\s*/i, ''));
  }
  if (lower.startsWith('!pdf')) {
    return await handlePdfAiModule(trimmed.replace(/^!pdf\s*/i, ''));
  }
  if (lower.startsWith('!ocr')) {
    return await handleOcrModule(trimmed.replace(/^!ocr\s*/i, ''));
  }
  if (lower.startsWith('!coding')) {
    return await handleCodingModule(trimmed.replace(/^!coding\s*/i, ''));
  }
  if (lower.startsWith('!translate')) {
    return await handleTranslatorModule(trimmed.replace(/^!translate\s*/i, ''));
  }
  if (lower.startsWith('!write')) {
    return await handleWritingModule(trimmed.replace(/^!write\s*/i, ''));
  }
  if (lower.startsWith('!analytics')) {
    return await handleAnalyticsModule(trimmed.replace(/^!analytics\s*/i, ''));
  }
  if (lower.startsWith('!reminder')) {
    return await handleReminderModule(trimmed.replace(/^!reminder\s*/i, ''));
  }
  if (lower.startsWith('!cloud')) {
    return await handleCloudStorageModule(trimmed.replace(/^!cloud\s*/i, ''));
  }
  if (lower.startsWith('!email')) {
    return await handleEmailModule(trimmed.replace(/^!email\s*/i, ''));
  }
  if (lower.startsWith('!util')) {
    return await handleUtilitiesModule(trimmed.replace(/^!util\s*/i, ''));
  }

  // Fallback to General AI Assistant with aesthetic system prompt
  const generalSystemPrompt = `Anda adalah 🤖 *JUSTBOT GENERAL AI ASSISTANT*. Berikan respon yang ramah, efisien, bermakna, dan rapi menggunakan emojifikasi serta pembatas garis estetik di WhatsApp.`;
  return await askGroqAI(trimmed, generalSystemPrompt);
}
