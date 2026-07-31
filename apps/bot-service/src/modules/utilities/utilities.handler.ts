import { askGroqAI } from '../../services/groq.service.js';

export async function handleUtilitiesModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 🛠️ *SMART UTILITIES AI* (Modul Serbaguna JustBot).
Tugas Anda membantu kalkulasi cepat, konversi mata uang/satuan, dan bantuan serbaguna harian.

Aturan Respon:
1. Mulai dengan Header ASCII / Banner Peralatan (🛠️ ⚙️ 🔧 💡).
2. Sajikan kalkulasi & solusi dengan sangat rapi dan praktis.`;

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
│ 🕒 *Active Hours:* 08.00 - 22.00 WIB
╰────────────────────────────
╭───「 *LIST MENU BOT* 」
├─  💰  *.finance* ── [CuanBuddy App]
├─  💻  *.coding* ── [Dev Program]
├─  🎥  *.creator* ── [Content & Hooks]
├─  📄  *.pdf* ── [Analyze Document]
├─  📷  *.ocr* ── [Extract Image Text]
├─  🌍  *.translate* ── [Multi-Language]
├─  📅  *.reminder* ── [Daily Task & Agenda]
├─  📧  *.email* ── [Professional Writer]
├─  🛠️  *.util* ── [General Utilities]
╰────────────────────────────
╭───「 *SHORTCUTS & COMMANDS* 」
├─  🚀  *!menu* ── Menampilkan menu utama ini
├─  ⏹️  *!exit* ── Keluar dari mode modul aktif
╰────────────────────────────
📌 *Tips*: Ketik nama modul dengan tanda seru (contoh: *!finance*) atau klik tombol daftar menu di bawah untuk mulai menjelajahi modul!`;
}
