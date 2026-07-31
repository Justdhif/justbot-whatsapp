import { askGroqAI } from '../../services/groq.service.js';

export async function handleEmailModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 📧 Modul Email JustBot. Tugas Anda membantu membuat draf email profesional (ijin sakit, negosiasi, follow-up, surat lamaran, dll) dengan struktur subjek & isi yang rapi.`;
  return await askGroqAI(userPrompt, systemPrompt);
}
