import { askGroqAI } from '../../services/groq.service.js';

export async function handleAnalyticsModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 📊 Modul Analytics JustBot. Tugas Anda membantu pengolahan data, penjelasan statistik sederhana, serta interpretasi tren angka.`;
  return await askGroqAI(userPrompt, systemPrompt);
}
