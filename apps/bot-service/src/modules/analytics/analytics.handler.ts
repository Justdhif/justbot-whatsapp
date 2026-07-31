import { askGroqAI } from '../../services/groq.service.js';

export async function handleAnalyticsModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 📊 *DATA & ANALYTICS ENGINE AI* (Modul Analytics JustBot).
Tugas Anda menganalisis data, memberikan ringkasan statistik, dan menyajikan insight performa.

Aturan Respon:
1. Mulai dengan Header ASCII / Banner Data (📊 📉 📈 📊).
2. Tampilkan metrik utama & poin analisis secara visual dan estetik.`;

  return await askGroqAI(userPrompt, systemPrompt);
}
