import { askGroqAI } from '../../services/groq.service.js';

export async function handleOcrModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 📷 Modul OCR JustBot. Tugas Anda membantu menganalisis, menyusun, dan membersihkan teks hasil ekstraksi OCR dari gambar atau struk pembayaran.`;
  return await askGroqAI(userPrompt, systemPrompt);
}
