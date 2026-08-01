import { askGroqAI } from '../../services/groq.service.js';
import { changeFont } from '../../utils/font.js';

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
  
  const titleMain = changeFont('JUSTBOT AI MULTI-SERVICE', 'boldSansUppercase');
  const titleUserInfo = changeFont('USER INFO', 'boldSansUppercase');
  const titleBotInfo = changeFont('BOT INFO', 'boldSansUppercase');
  const titleSkills = changeFont('BOT SKILLS', 'boldSansUppercase');
  const titleApps = changeFont('INTEGRATED APPS', 'boldSansUppercase');
  const titleShortcuts = changeFont('SHORTCUTS & COMMANDS', 'boldSansUppercase');

  // Generate subitems formatted in boldSansUppercase as seen in the mockup screenshot!
  const labelName = changeFont('Nama', 'boldSansUppercase');
  const labelTz = changeFont('Timezone', 'boldSansUppercase');
  const labelStatus = changeFont('Status', 'boldSansUppercase');
  const labelBotName = changeFont('Bot Name', 'boldSansUppercase');
  const labelEngine = changeFont('Engine', 'boldSansUppercase');
  const labelActive = changeFont('Active', 'boldSansUppercase');
  const labelHours = changeFont('Hours', 'boldSansUppercase');

  const skillFinance = changeFont('Konsultasi Keuangan', 'boldSansUppercase');
  const skillCoding = changeFont('Coding & Debugging', 'boldSansUppercase');
  const skillCreator = changeFont('Content Creator Script', 'boldSansUppercase');
  const skillPdf = changeFont('Analisis PDF & Dokumen', 'boldSansUppercase');
  const skillOcr = changeFont('Scan Teks Gambar (OCR)', 'boldSansUppercase');
  const skillTranslate = changeFont('Penerjemah Bahasa', 'boldSansUppercase');
  const skillReminder = changeFont('Pengingat & Agenda', 'boldSansUppercase');
  const skillEmail = changeFont('Email & Surat Formal', 'boldSansUppercase');
  const skillUtil = changeFont('Kalkulator & Konversi Satuan', 'boldSansUppercase');

  const appCuanBuddy = changeFont('CuanBuddy App', 'boldSansUppercase');
  
  const descMenu = changeFont('Menampilkan menu utama', 'boldSansUppercase');
  const descCuanBuddy = changeFont('Sambung & kelola CuanBuddy App', 'boldSansUppercase');
  const descExit = changeFont('Keluar dari mode integrasi', 'boldSansUppercase');

  return `╭─── o「 ${titleMain} 」o
│
├─── o(" ${titleUserInfo} ")
│ 👤 *${labelName}:* ${greetingName || 'Guest User'}
│ 🌍 *${labelTz}:* ${tzDisplay}
│ 🟢 *${labelStatus}:* Online
│
├─── o(" ${titleBotInfo} ")
├─✦ *${labelBotName}:* JustBot-Service
├─✦ *${labelEngine}:* Fastify & Groq AI
├─✦ *${labelActive}:* Sabtu - Kamis
├─✦ *${labelHours}:* 07.00 - 21.00 WIB
│
├─── o(" ${titleSkills} ")
├─✦ *${skillFinance}* 
├─✦ *${skillCoding}*
├─✦ *${skillCreator}*
├─✦ *${skillPdf}*
├─✦ *${skillOcr}*
├─✦ *${skillTranslate}*
├─✦ *${skillReminder}*
├─✦ *${skillEmail}*
├─✦ *${skillUtil}*
│
├─── o(" ${titleApps} ")
├─✦ *${appCuanBuddy}*
│
├─── o(" ${titleShortcuts} ")
├─✦  *.menu* ── ${descMenu}
├─✦  *.cuanbuddy* ── ${descCuanBuddy}
├─✦  *.exit* ── ${descExit}
╰────────────────────────────

📌 *Tips*: Bot ini secara otomatis mendeteksi kebutuhan Anda saat mengobrol biasa (tanpa mode khusus). Cukup tanyakan apa saja secara natural! Gunakan perintah \`.cuanbuddy\` jika ingin menyambungkan akun keuangan Anda.`;
}
