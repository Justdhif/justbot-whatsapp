import { askGroqAI } from '../../services/groq.service.js';

export async function handleWritingModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 📝 Modul Writing Assistant JustBot. Anda membantu penulisan esai, artikel, rephrasing, perbaikan tata bahasa/gramatika, dan pengubahan nada bicara (formal/casual).`;
  return await askGroqAI(userPrompt, systemPrompt);
}
