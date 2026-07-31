import { askGroqAI } from '../../services/groq.service.js';

export async function handleReminderModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 📅 Modul Reminder JustBot. Tugas Anda mendraf pengingat agenda, membuat to-do list terstruktur, dan estimasi penjadwalan waktu.`;
  return await askGroqAI(userPrompt, systemPrompt);
}
