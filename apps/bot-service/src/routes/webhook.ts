import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { processIncomingMessage, MODULE_DETAILS } from '../modules/router.js';
import { sendWhatsAppMessage, sendWhatsAppButtons, sendWhatsAppInteractiveList } from '../services/whatsapp.service.js';
import { getUserSession, setUserActiveMode } from '../utils/session.js';

interface WebhookQuery {
  'hub.mode'?: string;
  'hub.verify_token'?: string;
  'hub.challenge'?: string;
}

export async function webhookRoutes(fastify: FastifyInstance) {
  // GET /webhook - Meta WhatsApp Webhook Verification
  fastify.get('/webhook', async (request: FastifyRequest<{ Querystring: WebhookQuery }>, reply: FastifyReply) => {
    const mode = request.query['hub.mode'];
    const token = request.query['hub.verify_token'];
    const challenge = request.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === env.WA_VERIFY_TOKEN) {
        logger.info('✅ Webhook verified successfully!');
        return reply.status(200).send(challenge);
      } else {
        logger.warn('❌ Webhook verification failed: Token mismatch.');
        return reply.status(403).send('Verification token mismatch');
      }
    }

    return reply.status(400).send('Bad Request');
  });

  // POST /webhook - Handle Incoming WhatsApp Messages & Mode State Machine
  fastify.post('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    const body: any = request.body;

    try {
      if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        const messageObj = body.entry[0].changes[0].value.messages[0];
        const from = messageObj.from;

        let userText = '';

        if (messageObj.type === 'text') {
          userText = messageObj.text.body;
        } else if (messageObj.type === 'interactive' && messageObj.interactive?.button_reply) {
          userText = messageObj.interactive.button_reply.id || messageObj.interactive.button_reply.title;
        } else if (messageObj.type === 'interactive' && messageObj.interactive?.list_reply) {
          userText = messageObj.interactive.list_reply.id || messageObj.interactive.list_reply.title;
        }

        if (userText) {
          logger.info({ from, userText }, 'Processing user message / selection');

          const trimmed = userText.trim();
          const lower = trimmed.toLowerCase();
          const session = getUserSession(from);

          // 1. ACTION: User clicks "EXIT MODE"
          if (lower === 'action:exit' || lower === '!exit') {
            setUserActiveMode(from, null);

            const exitText = `🔴 *MODE DIMATIKAN*\n══════════════════════════════\nAnda telah keluar dari mode khusus. Silakan pilih modul baru atau ketik \`!menu\`.`;
            const exitButtons = [{ id: '!menu', title: '📋 Buka Menu' }];
            await sendWhatsAppButtons(from, exitText, exitButtons, '🤖 MODE OFF');
            return reply.status(200).send({ status: 'success' });
          }

          // 2. ACTION: User clicks "START MODE" (e.g. "action:start:coding")
          if (lower.startsWith('action:start:')) {
            const selectedMode = lower.replace('action:start:', '');
            const detail = MODULE_DETAILS[selectedMode];

            if (detail) {
              setUserActiveMode(from, selectedMode);

              const startedText = `🟢 *MODE ${detail.name.toUpperCase()} AKTIF!* 🟢
══════════════════════════════════════
${detail.icon} *Deskripsi*: ${detail.desc}

💡 *Status*: Sekarang Anda berada di mode khusus *${detail.name}*. Semua pertanyaan yang Anda kirim akan langsung dijawab oleh modul ini tanpa perlu mengetikkan perintah!

══════════════════════════════════════
👇 *Jika ingin keluar dari mode ini, klik tombol di bawah:*`;

              const exitButtons = [
                { id: 'action:exit', title: '🔴 Exit Mode' },
                { id: '!menu', title: '📋 Buka Menu' },
              ];

              await sendWhatsAppButtons(from, startedText, exitButtons, '🚀 MODE STATUS');
              return reply.status(200).send({ status: 'success' });
            }
          }

          // 3. ACTION: User selects module from LIST MENU (e.g. "select:module:coding")
          if (lower.startsWith('select:module:')) {
            const selectedMode = lower.replace('select:module:', '');
            const detail = MODULE_DETAILS[selectedMode];

            if (detail) {
              const previewText = `📌 *INFORMASI MODUL: ${detail.name.toUpperCase()}* ${detail.icon}
══════════════════════════════════════
${detail.desc}

✨ *Kemampuan Utama*:
${detail.capabilities.map((c) => ` • ${c}`).join('\n')}

══════════════════════════════════════
Tekan tombol *🚀 Start Mode* di bawah untuk masuk ke mode ini:`;

              const startButtons = [
                { id: `action:start:${selectedMode}`, title: '🚀 Start Mode' },
                { id: '!menu', title: '📋 Kembali Ke Menu' },
              ];

              await sendWhatsAppButtons(from, previewText, startButtons, `✨ PREVIEW: ${detail.name}`);
              return reply.status(200).send({ status: 'success' });
            }
          }

          // 4. ACTION: User asks for !menu
          if (lower === '!menu' || lower === '/help' || lower === 'help' || lower === 'menu') {
            const bodyText = `Selamat datang di *JustBot AI*! 🤖✨\nSilakan pilih modul fitur yang ingin Anda jelajahi di bawah ini:`;

            const sections = [
              {
                title: '⚡ KODING & PRODUKTIVITAS',
                rows: [
                  { id: 'select:module:coding', title: '💻 Coding Assistant', description: 'Bantuan koding, refactoring & debug' },
                  { id: 'select:module:pdf', title: '📄 PDF & Document AI', description: 'Ringkasan & analisis dokumen PDF' },
                  { id: 'select:module:email', title: '📧 Executive Email', description: 'Draf email & surat resmi' },
                ],
              },
              {
                title: '💰 BISNIS & KREATIF',
                rows: [
                  { id: 'select:module:finance', title: '💰 Finance Manager', description: 'Perencanaan keuangan & 50/30/20' },
                  { id: 'select:module:creator', title: '🎥 Content Creator', description: 'Ide konten viral & script TikTok' },
                ],
              },
              {
                title: '🛠️ TRANSLATE & HARIAN',
                rows: [
                  { id: 'select:module:translate', title: '🌍 Polyglot Translator', description: 'Terjemahan kontekstual multi-bahasa' },
                  { id: 'select:module:ocr', title: '📷 OCR Scanner', description: 'Merapikan teks hasil scan' },
                  { id: 'select:module:reminder', title: '📅 Agenda & Reminder', description: 'To-do list & jadwal kegiatan' },
                  { id: 'select:module:util', title: '🛠️ Smart Utilities', description: 'Kalkulator & bantuan serbaguna' },
                ],
              },
            ];

            const headerTitle = session.activeMode
              ? `🤖 MENU (Mode Aktif: ${session.activeMode.toUpperCase()})`
              : '🤖 JUSTBOT MULTI-MODULE MENU';

            await sendWhatsAppInteractiveList(from, bodyText, '📋 Pilih Modul Bot', sections, headerTitle);
            return reply.status(200).send({ status: 'success' });
          }

          // 5. Normal chat / Mode Active Chat processing
          const botReply = await processIncomingMessage(from, userText);

          // If user is in an active mode, attach Exit quick reply option
          if (session.activeMode) {
            const detail = MODULE_DETAILS[session.activeMode];
            const modeButtons = [{ id: 'action:exit', title: '🔴 Exit Mode' }];
            await sendWhatsAppButtons(from, botReply, modeButtons, `${detail?.icon || '🟢'} MODE: ${detail?.name || session.activeMode}`);
          } else {
            // If user sent unrecognized message outside active mode, send fallback guide + Quick Reply Button to open !menu directly!
            const fallbackButtons = [{ id: '!menu', title: '📋 Buka Menu Bot' }];
            await sendWhatsAppButtons(from, botReply, fallbackButtons, '🤖 JUSTBOT GUIDANCE');
          }
        }
      }
    } catch (error) {
      logger.error({ error }, 'Error processing incoming WhatsApp webhook payload');
    }

    return reply.status(200).send({ status: 'success' });
  });
}
