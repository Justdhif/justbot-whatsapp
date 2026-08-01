import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import serverless from 'serverless-http';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { webhookRoutes } from './routes/webhook.js';

const app = Fastify({
  logger: false,
});

app.register(formbody);


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


app.get('/health', async () => {
  return { status: 'ok', service: 'justbot-whatsapp-service', timestamp: new Date() };
});


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


if (process.env.NODE_ENV !== 'production' && !process.env.NETLIFY && !process.env.VERCEL) {
  startServer();
}


export default async function handler(req: any, res: any) {
  await app.ready();
  app.server.emit('request', req, res);
}

export const netlifyHandler = serverless(app as any);
