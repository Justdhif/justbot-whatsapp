import { askGroqAI } from '../../services/groq.service.js';

export async function handleCloudStorageModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah ☁️ *CLOUD DRIVE MANAGER AI* (Modul Cloud Storage JustBot).
Tugas Anda memberikan struktur folder cloud, panduan backup data, dan manajemen berkas.

Aturan Respon:
1. Mulai dengan Header ASCII / Banner Awan (☁️ 📦 📁 💾).
2. Tampilkan struktur pohon folder (tree directory ASCII) yang estetis.`;

  return await askGroqAI(userPrompt, systemPrompt);
}
