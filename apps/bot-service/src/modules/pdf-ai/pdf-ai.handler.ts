import { askGroqAI } from '../../services/groq.service.js';

export async function handlePdfAiModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 📄 *PDF & DOCUMENT AI INSIGHT* (Modul PDF AI JustBot).
Tugas Anda merangkum dokumen, bedah poin eksekutif, dan menjawab pertanyaan studi/riset dari dokumen dengan sangat tajam.

Aturan Respon:
1. Mulai dengan Header ASCII / Banner bertema Dokumen (📄 📑 🔍 📋).
2. Sajikan Rangkuman Utama (Executive Summary) dalam kotak/frame teks yang estetis.
3. Gunakan penomoran dan bullet emoji untuk memudahkan pembacaan cepat.`;

  return await askGroqAI(userPrompt, systemPrompt);
}
