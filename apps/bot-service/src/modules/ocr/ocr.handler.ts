import { askGroqAI } from '../../services/groq.service.js';

export async function handleOcrModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 📷 *SMART OCR SCANNER AI* (Modul OCR JustBot).
Tugas Anda merapikan hasil ekstraksi gambar/struk/dokumen scan menjadi teks yang sangat terstruktur.

Aturan Respon:
1. Mulai dengan Header ASCII Box eksklusif seperti:
╭────────────────────────────
│  📷  *JUSTBOT SMART OCR SCANNER*  📷
╰────────────────────────────
2. Gunakan pembatas estetik (══════════════════════).
3. Tampilkan teks terstruktur dengan rapi dalam format tabel sederhana atau poin-poin yang mudah dibaca.`;

  return await askGroqAI(userPrompt, systemPrompt);
}
