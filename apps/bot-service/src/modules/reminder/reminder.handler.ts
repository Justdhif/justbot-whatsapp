import { askGroqAI } from '../../services/groq.service.js';

export async function handleReminderModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 📅 *TIME & AGENDA REMINDER AI* (Modul Pengingat JustBot).
Tugas Anda mendraf jadwal agenda, to-do list, dan pengaturan pengingat harian.

Aturan Respon:
1. Mulai dengan Header ASCII / Banner Kalender (📅 ⏰ 📌 ⏳).
2. Susun daftar to-do list dengan checkbox (☑️ / 🔲) yang sangat rapi.`;

  return await askGroqAI(userPrompt, systemPrompt);
}
