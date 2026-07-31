import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { webhookRoutes } from './routes/webhook.js';

const app = Fastify({
  logger: false,
});

app.register(formbody);

// Root route (Welcome page)
app.get('/', async () => {
  return {
    name: 'JustBot WhatsApp Service',
    status: 'online',
    version: '1.0.0',
    description: 'WhatsApp Bot Service powered by Fastify, TypeScript, Groq AI & Meta Cloud API',
    endpoints: {
      health: '/health',
      webhook: '/webhook',
    },
  };
});

// Health check endpoint
app.get('/health', async () => {
  return { status: 'ok', service: 'justbot-whatsapp-service', timestamp: new Date() };
});

// Register Webhook routes
app.register(webhookRoutes);

async function startServer() {
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    logger.info(`🚀 JustBot WhatsApp Service running on http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    logger.error(err, 'Failed to start Fastify server');
    process.exit(1);
  }
}

// If running locally, start HTTP server
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  startServer();
}

// Export Fastify handler for Vercel Serverless
export default async function handler(req: any, res: any) {
  await app.ready();
  app.server.emit('request', req, res);
}
