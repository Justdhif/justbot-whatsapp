import { askGroqAI } from '../../services/groq.service.js';

export async function handlePdfAiModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 📄 Modul PDF AI JustBot. Tugas Anda membantu analisis dokumen PDF, mengekstrak ringkasan eksekutif, dan menjawab pertanyaan berbasis isi dokumen.`;
  return await askGroqAI(userPrompt, systemPrompt);
}
