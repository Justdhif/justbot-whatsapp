import { askGroqAI } from '../../services/groq.service.js';

export async function handleUtilitiesModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 🛠️ *SMART UTILITIES AI* (Modul Serbaguna JustBot).
Tugas Anda membantu kalkulasi cepat, konversi mata uang/satuan, dan bantuan serbaguna harian.

Aturan Respon:
1. Mulai dengan Header ASCII / Banner Peralatan (🛠️ ⚙️ 🔧 💡).
2. Sajikan kalkulasi & solusi dengan sangat rapi dan praktis.`;

  return await askGroqAI(userPrompt, systemPrompt);
}

export function getHelpMenu(): string {
  return `┌────────────────────────────────────────┐
│   🤖  *JUSTBOT WHATSAPP MULTI-MODULE*  🤖   │
└────────────────────────────────────────┘
══════════════════════════════════════════

Pilih modul dengan mengirimkan perintah unik di bawah:

💰 *FINANCE ENGINE*
 └─ Ketik: \`!finance <pertanyaan>\`
 └─ _Analisis keuangan, 50/30/20, & investasi_

🎥 *CONTENT CREATOR STUDIO*
 └─ Ketik: \`!creator <topik/ide>\`
 └─ _Ide konten viral, script TikTok, & hashtag_

📄 *PDF & DOCUMENT AI*
 └─ Ketik: \`!pdf <pertanyaan/dokumen>\`
 └─ _Ringkasan eksekutif & bedah file PDF_

📷 *SMART OCR SCANNER*
 └─ Ketik: \`!ocr <teks_hasil_scan>\`
 └─ _Rapikan teks ekstraksi dari gambar/struk_

💻 *DEV CODING ASSISTANT*
 └─ Ketik: \`!coding <kode/soal>\`
 └─ _Refactoring, snippet kode, & debug error_

🌍 *POLYGLOT TRANSLATOR*
 └─ Ketik: \`!translate <teks>\`
 └─ _Terjemahan kontekstual antar bahasa_

📝 *WRITING ASSISTANT*
 └─ Ketik: \`!write <topik/draft>\`
 └─ _Penulisan esai, artikel, & perbaikan tone_

📊 *DATA ANALYTICS*
 └─ Ketik: \`!analytics <data/soal>\`
 └─ _Statistik, tren angka, & ringkasan data_

📅 *AGENDA & REMINDER*
 └─ Ketik: \`!reminder <agenda>\`
 └─ _To-do list terstruktur & jadwal kegiatan_

☁️ *CLOUD STORAGE MANAGER*
 └─ Ketik: \`!cloud <pertanyaan/file>\`
 └─ _Struktur pohon folder & panduan drive_

📧 *EXECUTIVE EMAIL MAKER*
 └─ Ketik: \`!email <tujuan_email>\`
 └─ _Draf email profesional & surat resmi_

🛠️ *SMART UTILITIES*
 └─ Ketik: \`!util <pertanyaan>\`
 └─ _Kalkulator, konversi satuan, & info umum_

══════════════════════════════════════════
💡 _Kirimkan pesan biasa tanpa perintah untuk berbicara langsung dengan AI General Assistant JustBot._`;
}
