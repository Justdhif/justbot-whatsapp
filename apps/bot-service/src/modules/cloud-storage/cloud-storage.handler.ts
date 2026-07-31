import { askGroqAI } from '../../services/groq.service.js';

export async function handleCloudStorageModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah ☁️ Modul Cloud Storage JustBot. Tugas Anda membantu memberikan informasi struktur penyimpanan folder, saran manajemen file drive/cloud, dan pengorganisasian file.`;
  return await askGroqAI(userPrompt, systemPrompt);
}
