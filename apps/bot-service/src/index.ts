import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import serverless from 'serverless-http';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { webhookRoutes } from './infrastructure/web/webhook.routes.js';
import fs from 'fs';
import path from 'path';

const app = Fastify({
  logger: false,
});

app.register(formbody);

app.get('/assets/:filename', async (request, reply) => {
  const { filename } = request.params as { filename: string };

  let filePath = path.resolve(process.cwd(), 'src/assets', filename);
  if (!fs.existsSync(filePath)) {
    filePath = path.resolve(process.cwd(), 'apps/bot-service/src/assets', filename);
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '..', 'src', 'assets', filename);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, 'assets', filename);
    }
  }

  if (fs.existsSync(filePath)) {
    const stream = fs.createReadStream(filePath);
    let contentType = 'application/octet-stream';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (filename.endsWith('.png')) {
      contentType = 'image/png';
    } else if (filename.endsWith('.ttf')) {
      contentType = 'font/ttf';
    }
    
    return reply.type(contentType).send(stream);
  } else {
    return reply.status(404).send({ error: 'Asset not found' });
  }
});

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
