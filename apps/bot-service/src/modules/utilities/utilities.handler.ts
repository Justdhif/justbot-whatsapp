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
  
  const titleMain = changeFont('JUSTBOT AI', 'smallCaps');
  const titleUserInfo = changeFont('USER INFO', 'smallCaps');
  const titleBotInfo = changeFont('BOT INFO', 'smallCaps');
  const titleSkills = changeFont('BOT SKILLS', 'smallCaps');
  const titleApps = changeFont('INTEGRATED APPS', 'smallCaps');
  const titleShortcuts = changeFont('COMMANDS', 'smallCaps');

  const labelName = changeFont('Nama', 'smallCaps');
  const labelTz = changeFont('Timezone', 'smallCaps');
  const labelStatus = changeFont('Status', 'smallCaps');
  const labelBotName = changeFont('Bot Name', 'smallCaps');
  const labelEngine = changeFont('Engine', 'smallCaps');
  const labelActive = changeFont('Active', 'smallCaps');
  const labelHours = changeFont('Hours', 'smallCaps');

  const skillFinance = changeFont('Konsultasi Keuangan', 'smallCaps');
  const skillCoding = changeFont('Coding & Debugging', 'smallCaps');
  const skillCreator = changeFont('Content Creator Script', 'smallCaps');
  const skillPdf = changeFont('Analisis PDF & Dokumen', 'smallCaps');
  const skillOcr = changeFont('Scan Teks Gambar (OCR)', 'smallCaps');
  const skillTranslate = changeFont('Penerjemah Bahasa', 'smallCaps');
  const skillReminder = changeFont('Pengingat & Agenda', 'smallCaps');
  const skillEmail = changeFont('Email & Surat Formal', 'smallCaps');
  const skillUtil = changeFont('Kalkulator & Konversi', 'smallCaps');
  const skillBrat = changeFont('Brat Sticker Generator', 'smallCaps');
  const skillBratVideo = changeFont('Brat Video Sticker', 'smallCaps');

  const appCuanBuddy = changeFont('CuanBuddy App', 'smallCaps');
  
  const descMenu = changeFont('Menampilkan menu', 'smallCaps');
  const descCuanBuddy = changeFont('kelola CuanBuddy App', 'smallCaps');
  const descBrat = changeFont('Buat sticker Brat', 'smallCaps');
  const descBratVideo = changeFont('Buat sticker animasi Brat', 'smallCaps');
  const descExit = changeFont('Keluar dari mode', 'smallCaps');

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
├─✦ *${labelHours}:* 07.00 - 21.00
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
├─✦ *${skillBrat}*
├─✦ *${skillBratVideo}*
│
├─── o(" ${titleApps} ")
├─✦ *${appCuanBuddy}*
│
├─── o(" ${titleShortcuts} ")
├─✦  *.menu* ─ ${descMenu}
├─✦  *.brat <teks>* ─ ${descBrat}
├─✦  *.bratv <teks>* ─ ${descBratVideo}
├─✦  *.cuanbuddy* ─ ${descCuanBuddy}
├─✦  *.exit* ─ ${descExit}
╰────────────────────────────

📌 *Tips*: Bot ini secara otomatis mendeteksi kebutuhan Anda saat mengobrol biasa (tanpa mode khusus). Cukup tanyakan apa saja secara natural! Gunakan perintah \`.cuanbuddy\` jika ingin menyambungkan akun keuangan Anda.`;
}
