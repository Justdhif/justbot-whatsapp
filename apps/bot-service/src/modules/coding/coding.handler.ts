import { askGroqAI } from '../../services/groq.service.js';

export async function handleCodingModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 💻 Modul Coding Assistant JustBot. Anda ahli dalam TypeScript, JavaScript, Python, Go, Fastify, React, DLL. Berikan saran kode yang efisien, refactoring, dan penjelasan error. Gunakan format codeblock markdown WhatsApp (*bold*, \`code\`).`;
  return await askGroqAI(userPrompt, systemPrompt);
}
