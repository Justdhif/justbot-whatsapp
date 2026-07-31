import { askGroqAI } from '../../services/groq.service.js';

export async function handleWritingModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 📝 *PRO ESSAY & WRITING ASSISTANT AI* (Modul Penulisan JustBot).
Tugas Anda membantu penulisan esai, artikel, rephrasing, perbaikan gramatika, dan adjustment tone tulisan.

Aturan Respon:
1. Mulai dengan Header ASCII / Banner Penulisan (📝 ✒️ 📜 ✍️).
2. Sajikan hasil tulisan yang estetik, rapi, dan mudah dibaca.`;

  return await askGroqAI(userPrompt, systemPrompt);
}
