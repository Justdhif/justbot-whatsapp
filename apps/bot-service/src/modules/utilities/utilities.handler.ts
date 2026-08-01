import { askGroqAI } from '../../services/groq.service.js';

export async function handleUtilitiesModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 🛠️ *SMART UTILITIES AI* (Modul Serbaguna JustBot).
Tugas Anda membantu kalkulasi cepat, konversi mata uang/satuan, dan bantuan serbaguna harian.

Aturan Respon:
1. Mulai dengan Header ASCII Box eksklusif seperti:
╭────────────────────────────
│  🛠️  *JUSTBOT SMART UTILITIES*  🛠️
╰────────────────────────────
2. Gunakan pembatas estetik (══════════════════════).
3. Sajikan kalkulasi & solusi dengan sangat rapi dan praktis.`;

  return await askGroqAI(userPrompt, systemPrompt);
}

export function getHelpMenu(senderName?: string, timezoneName?: string): string {
  const greetingName = senderName ? ` ${senderName}` : '';
  const tzDisplay = timezoneName || 'WIB (Asia/Jakarta)';
  
  return `╭────────────────────────────
│  ⚡ *JUSTBOT AI MULTI-SERVICE* ⚡
╰────────────────────────────
╭───「 *USER INFO* 」
│ 👤 *Nama:* ${greetingName || 'Guest User'}
│ 🌍 *Timezone:* ${tzDisplay}
│ 🟢 *Status:* Online
╰────────────────────────────
╭───「 *BOT INFO* 」
│ 🤖 *Bot Name:* JustBot-Service
│ 🔗 *Engine:* Fastify & Groq AI
│ 📅 *Active Days:* Sab - Kam (Jumat Libur)
│ 🕒 *Active Hours:* 07.00 - 21.00 WIB
╰────────────────────────────
╭───「 *INTERACTIVE MODULES (MODES)* 」
├─  💰  *.finance* ── [CuanBuddy App]
├─  💻  *.coding* ── [Dev Program]
├─  🎥  *.creator* ── [Content & Hooks]
├─  📄  *.pdf* ── [Analyze Document]
├─  📷  *.ocr* ── [Extract Image Text]
├─  🌍  *.translate* ── [Multi-Language]
├─  📅  *.reminder* ── [Daily Task & Agenda]
├─  📧  *.email* ── [Professional Writer]
╰────────────────────────────
╭───「 *COMMAND ONLY MODULES* 」
├─  🛠️  *.util <soal>* ── [Kalkulator & Konversi]
├─  🎨  *.brat <teks>* ── [Brat Sticker]
├─  🎬  *.bratvid <teks>* ── [Animated Brat]
├─  💬  *.qchat <teks>* ── [Android Bubble]
├─  🍏  *.qchat-ios <teks>* ── [iOS Bubble]
├─  📸  *kirim gambar + .s* ── [Photo Sticker]
╰────────────────────────────
╭───「 *SHORTCUTS & COMMANDS* 」
├─  🚀  *.menu* ── Menampilkan menu utama ini
├─  ⏹️  *.exit* ── Keluar dari mode modul aktif
╰────────────────────────────
📌 *Tips*: Anda bisa masuk ke Mode Interaktif dengan memilih modul dari tombol menu di bawah, atau langsung menggunakan command instan bertanda titik (.) di chat.`;
}
