import Groq from 'groq-sdk';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

export async function askGroqAI(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt || 'Anda adalah JustBot AI, asisten WhatsApp serbaguna yang ramah, efisien, dan komunikatif.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    return response.choices[0]?.message?.content || 'Maaf, saya tidak dapat memproses tanggapan saat ini.';
  } catch (error) {
    logger.error({ error }, 'Groq AI Service Error');
    return 'Terjadi kesalahan saat menghubungkan ke AI Engine Groq.';
  }
}
