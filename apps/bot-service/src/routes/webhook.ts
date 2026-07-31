import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { processIncomingMessage } from '../modules/router.js';
import { sendWhatsAppMessage } from '../services/whatsapp.service.js';

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

  // POST /webhook - Handle Incoming WhatsApp Messages
  fastify.post('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    const body: any = request.body;

    // Immediately respond HTTP 200 OK to WhatsApp API to acknowledge receipt
    reply.status(200).send({ status: 'success' });

    try {
      if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        const messageObj = body.entry[0].changes[0].value.messages[0];
        const from = messageObj.from; // User WhatsApp Phone Number

        if (messageObj.type === 'text') {
          const incomingText = messageObj.text.body;
          logger.info({ from, incomingText }, 'Received WhatsApp Text Message');

          // Process message through module router
          const botReply = await processIncomingMessage(incomingText);

          // Send response back to user
          await sendWhatsAppMessage(from, botReply);
        }
      }
    } catch (error) {
      logger.error({ error }, 'Error processing incoming WhatsApp webhook payload');
    }
  });
}
