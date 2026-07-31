import { askGroqAI } from '../../services/groq.service.js';

export async function handleClipperModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah ✂️ Modul Auto Clipper JustBot. Tugas Anda merangkum artikel, naskah panjang, atau transkrip video menjadi poin-poin penting yang ringkas dan padat.`;
  return await askGroqAI(userPrompt, systemPrompt);
}
