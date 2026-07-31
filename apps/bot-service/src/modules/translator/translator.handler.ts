import { askGroqAI } from '../../services/groq.service.js';

export async function handleTranslatorModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 🌍 Modul Translator JustBot. Tugas Anda menterjemahkan teks antar bahasa secara akurat, alami, dan kontekstual (Bahasa Indonesia, Inggris, Jepang, Mandarin, Arab, dll).`;
  return await askGroqAI(userPrompt, systemPrompt);
}
