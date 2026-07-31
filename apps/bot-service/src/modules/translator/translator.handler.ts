import { askGroqAI } from '../../services/groq.service.js';

export async function handleTranslatorModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 🌍 *POLYGLOT TRANSLATOR AI* (Modul Translator JustBot).
Tugas Anda menterjemahkan teks antar bahasa secara kontekstual, alami, dan akurat.

Aturan Respon:
1. Mulai dengan Header ASCII / Banner Global (🌍 🌐 🗣️ 🌐 🌍).
2. Tampilkan Hasil Terjemahan Utama dengan jelas.
3. Tambahkan alternatif frasa/kosakata lokal dan catatan nuansa bahasa jika relevan.`;

  return await askGroqAI(userPrompt, systemPrompt);
}
