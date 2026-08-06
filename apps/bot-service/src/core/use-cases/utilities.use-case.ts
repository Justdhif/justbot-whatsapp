import { askGroqAI } from '../../infrastructure/gateways/groq.gateway.js';
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

export function getHelpMenu(senderName?: string, managerName?: string): string {
  const greetingName = senderName ? `${senderName}` : 'Guest User';
  
  const titleMain = changeFont('JUSTBOT AI', 'smallCaps');
  const titleUserInfo = changeFont('USER INFO', 'smallCaps');
  const titleBotInfo = changeFont('BOT INFO', 'smallCaps');
  const titleSkills = changeFont('BOT MODULES', 'smallCaps');
  const titleShortcuts = changeFont('BOT COMMAND', 'smallCaps');
  const titleApps = changeFont('INTEGRATED APPS', 'smallCaps');

  const labelName = changeFont('Nama WA', 'smallCaps');
  const labelManager = changeFont('Manager', 'smallCaps');
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
  const skillSticker = changeFont('Sticker Generator', 'smallCaps');

  const bratGenerator = changeFont('Brat Generator', 'smallCaps');

  const managerLine = managerName ? `\n│ 💼 *${labelManager}:* ${managerName}` : '';

  return `╭─── o「 ${titleMain} 」o
│
├─── o(" ${titleUserInfo} ")
│ 👤 *${labelName}:* ${greetingName}${managerLine}
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
├─✦ *${skillSticker}*
│
├─── o(" ${titleShortcuts} ")
├─✦  *.brat* _<teks>_
├─✦  *.catat* _<deskripsi>_
├─✦  *.edit* _<deskripsi>_
├─✦  *.exit*
├─✦  *.finance*
├─✦  *.hapus* _<deskripsi>_
├─✦  *.ingatkan* _<deskripsi>_
├─✦  *.iqc* _<teks>_
├─✦  *.laporan*
├─✦  *.manager*
├─✦  *.menu*
├─✦  *.pengingat*
├─✦  *.riwayat* _[masuk|keluar]_
├─✦  *.sticker*
╰────────────────────────────
📌 *Tips*: Bot ini secara otomatis mendeteksi kebutuhan Anda saat mengobrol biasa (tanpa mode khusus). Cukup tanyakan apa saja secara natural!`;
}
