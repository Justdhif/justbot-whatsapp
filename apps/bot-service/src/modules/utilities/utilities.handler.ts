import { askGroqAI } from "../../services/groq.service.js";

export async function handleUtilitiesModule(
  userPrompt: string,
): Promise<string> {
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

export function getHelpMenu(
  senderName?: string,
  timezoneName?: string,
): string {
  const greetingName = senderName ? ` ${senderName}` : "";
  const tzDisplay = timezoneName || "WIB (Asia/Jakarta)";
  const titleMain = "JUSTBOT AI MULTI-SERVICE";

  return `╭─── o「 ${titleMain} 」o
│
├─── o(" USER INFO ")
│ 👤 *Nama:* ${greetingName || "Guest User"}
│ 🌍 *Timezone:* ${tzDisplay}
│ 🟢 *Status:* Online
│
├─── o(" BOT INFO ")
│ 🤖 *Bot Name:* JustBot-Service
│ 🔗 *Engine:* Fastify & Groq AI
│ 📅 *Active:* Sabtu - Kamis
│ 🕒 *Hours:* 07.00 - 21.00 WIB
│
├─── o(" LIST MODULES ")
├─  💼  *.finance*
├─  💻  *.coding*
├─  🎥  *.creator*
├─  📄  *.pdf*
├─  📷  *.ocr*
├─  🌍  *.translate*
├─  📅  *.reminder*
├─  📧  *.email*
├─  🛠️  *util* (kalkulator & info)
│
├─── o(" INTEGRATED APPS ")
├─  💳  *.cuanbuddy*
│
├─── o(" SHORTCUTS & COMMANDS ")
├─  🚀  *.menu* - Menampilkan menu utama
├─  ⏹️  *.exit* - Keluar dari mode modul
╰────────────────────────────

📌 *Tips*: Anda bisa masuk ke salah satu modul fitur di atas dengan mengetikkan langsung perintahnya (contoh: \`.finance\` atau \`.cuanbuddy\`). Khusus untuk perhitungan matematika & konversi satuan, Anda bisa langsung mengetikkannya di chat tanpa command apa pun!`;
}
