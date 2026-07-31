import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { processIncomingMessage } from '../modules/router.js';
import { sendWhatsAppMessage, sendWhatsAppImageWithButtons } from '../services/whatsapp.service.js';

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

  // POST /webhook - Handle Incoming WhatsApp Messages & Interactive Clicks
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
        }

        if (userText) {
          logger.info({ from, userText }, 'Processing user message / button click');

          const trimmed = userText.trim();
          const lower = trimmed.toLowerCase();

          // !menu command -> Send Banner Image + Text Menu dengan 8 Modul Pilihan Utama!
          if (lower === '!menu' || lower === '/help' || lower === 'help' || lower === 'menu') {
            const menuCaption = `🤖 *JUSTBOT AI ASSISTANT* 🤖
══════════════════════════════════════

Daftar modul fitur utama yang tersedia:

💻 *Coding Assistant*: \`!coding <kode/error>\`
💰 *Finance Manager*: \`!finance <pertanyaan>\`
🎥 *Content Creator*: \`!creator <topik>\`
🌍 *Polyglot Translator*: \`!translate <teks>\`
📷 *OCR Scanner*: \`!ocr <teks_scan>\`
📄 *PDF & Document AI*: \`!pdf <dokumen>\`
📧 *Executive Email*: \`!email <tujuan>\`
📅 *Agenda & Reminder*: \`!reminder <agenda>\`
🛠️ *Smart Utilities*: \`!util <pertanyaan>\`

══════════════════════════════════════
👇 *Tekan tombol cepat di bawah:*`;

            const buttons = [
              { id: '!coding Buatkan snippet kode TypeScript', title: '💻 Coding AI' },
              { id: '!finance Halo bot, pandu keuangan saya', title: '💰 Finance AI' },
              { id: '!creator Berikan 3 ide konten viral', title: '🎥 Creator AI' },
            ];

            // Banner Image URL Publik HD
            const bannerUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';

            await sendWhatsAppImageWithButtons(from, bannerUrl, menuCaption, buttons);
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
