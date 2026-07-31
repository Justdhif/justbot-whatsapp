import { askGroqAI } from '../../services/groq.service.js';

export async function handleCreatorModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 🎥 Modul Content Creator JustBot. Tugas Anda membantu membuat ide konten viral, naskah/script TikTok/Reels/YouTube Shorts, hashtag strategist, dan hook menarik untuk media sosial. Rapi & kreatif.`;
  return await askGroqAI(userPrompt, systemPrompt);
}
