import { askGroqAI } from '../../services/groq.service.js';

export async function handleFinanceModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 💰 Modul Finance JustBot. Tugas Anda membantu pencatatan keuangan, saran penganggaran (budgeting 50/30/20), kalkulasi kalkulator finansial, dan saran investasi tingkat dasar secara profesional & rapi. Gunakan format markdown WhatsApp (*bold*, _italic_).`;
  return await askGroqAI(userPrompt, systemPrompt);
}
