import { askGroqAI } from "../../services/groq.service.js";
import { changeFont } from "../../utils/font.js";

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

  const titleMain = changeFont("JUSTBOT AI MULTI-SERVICE", "boldSans");
  const titleUserInfo = changeFont("USER INFO", "boldSans");
  const titleBotInfo = changeFont("BOT INFO", "boldSans");
  const titleModules = changeFont("LIST MODULES", "boldSans");
  const titleApps = changeFont("INTEGRATED APPS", "boldSans");
  const titleShortcuts = changeFont("SHORTCUTS & COMMANDS", "boldSans");

  return `╭─── o「 ${titleMain} 」o
│
├─── o(" ${titleUserInfo} ")
│ 👤 *Nama:* ${greetingName || "Guest User"}
│ 🌍 *Timezone:* ${tzDisplay}
│ 🟢 *Status:* Online
│
├─── o(" ${titleBotInfo} ")
│ 🤖 *Bot Name:* JustBot-Service
│ 🔗 *Engine:* Fastify & Groq AI
│ 📅 *Active:* Sabtu - Kamis
│ 🕒 *Hours:* 07.00 - 21.00 WIB
│
├─── o(" ${titleModules} ")
├─  💼  *.finance*
├─  💻  *.coding*
├─  🎥  *.creator*
├─  📄  *.pdf*
├─  📷  *.ocr*
├─  🌍  *.translate*
├─  📅  *.reminder*
├─  📧  *.email*
├─  🛠️  *util* (kalkulator & info)
├─  🎨  *.brat* (sticker generator)
│
├─── o(" ${titleApps} ")
├─  💳  *.cuanbuddy*
│
├─── o(" ${titleShortcuts} ")
├─  🚀  *.menu* - Menampilkan menu utama
├─  🎨  *.brat <teks>* - Generate sticker brat
├─  🎬  *.bratvid <teks>* - Generate brat video sticker
├─  ⏹️  *.exit* - Keluar dari mode modul
╰────────────────────────────

📌 *Tips*: Anda bisa masuk ke salah satu modul fitur di atas dengan mengetikkan langsung perintahnya (contoh: \`.finance\` atau \`.cuanbuddy\`) untuk memunculkan panel kontrol modul.`;
}
