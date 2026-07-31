import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { processIncomingMessage } from '../modules/router.js';
import { sendWhatsAppMessage, sendWhatsAppInteractiveList } from '../services/whatsapp.service.js';

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

  // POST /webhook - Handle Incoming WhatsApp Messages & Interactive Menu Clicks
  fastify.post('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    const body: any = request.body;

    try {
      if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        const messageObj = body.entry[0].changes[0].value.messages[0];
        const from = messageObj.from;

        let userText = '';

        // Handle normal text message
        if (messageObj.type === 'text') {
          userText = messageObj.text.body;
        } 
        // Handle Interactive Quick Reply Button Clicks
        else if (messageObj.type === 'interactive' && messageObj.interactive?.button_reply) {
          userText = messageObj.interactive.button_reply.id || messageObj.interactive.button_reply.title;
        }
        // Handle Interactive List Menu Item Clicks (Select from List)
        else if (messageObj.type === 'interactive' && messageObj.interactive?.list_reply) {
          userText = messageObj.interactive.list_reply.id || messageObj.interactive.list_reply.title;
        }

        if (userText) {
          logger.info({ from, userText }, 'Processing user message / interactive selection');

          const trimmed = userText.trim();
          const lower = trimmed.toLowerCase();

          // If user asks for !menu, send Interactive List Menu (Dropdown List with all modules!)
          if (lower === '!menu' || lower === '/help' || lower === 'help' || lower === 'menu') {
            const bodyText = `Selamat datang di *JustBot AI*! 🤖✨\nSilakan tekan tombol di bawah ini untuk memilih modul fitur yang ingin Anda gunakan:`;
            
            const sections = [
              {
                title: '⚡ PRODUKTIVITAS & KODING',
                rows: [
                  { id: '!coding Buka modul coding assistant', title: '💻 Coding Assistant', description: 'Bantuan koding, refactoring & debug' },
                  { id: '!pdf Buka modul PDF AI', title: '📄 PDF & Document AI', description: 'Ringkasan & analisis dokumen PDF' },
                  { id: '!write Buka modul writing assistant', title: '📝 Writing Assistant', description: 'Penulisan esai, artikel & tone text' },
                ],
              },
              {
                title: '💰 BISNIS & ANALISIS',
                rows: [
                  { id: '!finance Buka modul keuangan', title: '💰 Finance Manager', description: 'Perencanaan keuangan & 50/30/20' },
                  { id: '!analytics Buka modul data analytics', title: '📊 Data Analytics', description: 'Statistik & analisis tren angka' },
                  { id: '!creator Buka modul content creator', title: '🎥 Content Creator', description: 'Ide konten viral & script TikTok' },
                ],
              },
              {
                title: '🛠️ UTILITY & HARIAN',
                rows: [
                  { id: '!translate Buka modul translator', title: '🌍 Polyglot Translator', description: 'Terjemahan kontekstual multi-bahasa' },
                  { id: '!reminder Buka modul pengingat', title: '📅 Agenda & Reminder', description: 'To-do list & jadwal kegiatan' },
                  { id: '!email Buka modul draf email', title: '📧 Executive Email', description: 'Draf email & surat profesional' },
                  { id: '!util Buka modul utilities', title: '🛠️ Smart Utilities', description: 'Kalkulator & bantuan serbaguna' },
                ],
              },
            ];

            await sendWhatsAppInteractiveList(from, bodyText, '📋 Pilih Modul Bot', sections, '🤖 JUSTBOT MULTI-MODULE MENU');
          } else {
            const botReply = await processIncomingMessage(userText);
            await sendWhatsAppMessage(from, botReply);
          }
        }
      }
    } catch (error) {
      logger.error({ error }, 'Error processing incoming WhatsApp webhook payload');
    }

    return reply.status(200).send({ status: 'success' });
  });
}
