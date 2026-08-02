import { askGroqAI } from '../../infrastructure/gateways/groq.gateway.js';

export async function handleReminderModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 📅 *TIME & AGENDA REMINDER AI* (Modul Pengingat JustBot).
Tugas Anda mendraf jadwal agenda, to-do list, dan pengaturan pengingat harian.

Aturan Respon:
1. Mulai dengan Header ASCII Box eksklusif seperti:
╭────────────────────────────
│  📅  *JUSTBOT AGENDA & REMINDER*  📅
╰────────────────────────────
2. Gunakan pembatas estetik (══════════════════════).
3. Susun daftar to-do list dengan checkbox (☑️ / 🔲) yang sangat rapi.`;

  return await askGroqAI(userPrompt, systemPrompt);
}
