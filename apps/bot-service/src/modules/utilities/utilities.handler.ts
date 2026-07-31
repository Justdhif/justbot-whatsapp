import { askGroqAI } from '../../services/groq.service.js';

export async function handleUtilitiesModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 🛠️ Modul Utilities JustBot. Tugas Anda membantu kalkulasi cepat, konversi mata uang/satuan, acak kata/angka, dan bantuan serbaguna harian.`;
  return await askGroqAI(userPrompt, systemPrompt);
}

export function getHelpMenu(): string {
  return `🤖 *JUSTBOT WHATSAPP ASSISTANT* 🤖
Selamat datang! Berikut daftar modul & kata kunci yang bisa Anda gunakan:

💰 *Finance* (Ketik: \`!finance <pertanyaan>\`)
🎥 *Content Creator* (Ketik: \`!creator <topik>\`)
✂️ *Auto Clipper* (Ketik: \`!clipper <teks/link>\`)
📄 *PDF AI* (Ketik: \`!pdf <pertanyaan/teks>\`)
📷 *OCR* (Ketik: \`!ocr <teks_hasil_scan>\`)
💻 *Coding Assistant* (Ketik: \`!coding <kode/soal>\`)
🌍 *Translator* (Ketik: \`!translate <teks>\`)
📝 *Writing Assistant* (Ketik: \`!write <topik/draft>\`)
📊 *Analytics* (Ketik: \`!analytics <data/pertanyaan>\`)
📅 *Reminder* (Ketik: \`!reminder <agenda>\`)
☁️ *Cloud Storage* (Ketik: \`!cloud <pertanyaan>\`)
📧 *Email* (Ketik: \`!email <tujuan_email>\`)
🛠️ *Utilities* (Ketik: \`!util <pertanyaan>\`)

💡 _Atau cukup kirimkan pesan biasa untuk berdiskusi langsung dengan AI General Assistant JustBot._`;
}
