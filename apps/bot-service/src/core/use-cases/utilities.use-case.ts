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

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function formatEffectiveDays(days: number[]): string {
  if (!days || days.length === 0) return 'Tidak Aktif';
  if (days.length === 7) return 'Setiap Hari';
  
  const sortedDays = [...days].sort((a, b) => a - b);
  
  let isContiguous = true;
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i] !== sortedDays[i - 1] + 1) {
      isContiguous = false;
      break;
    }
  }
  
  if (isContiguous && sortedDays.length > 2) {
    return `${DAY_NAMES[sortedDays[0]]} - ${DAY_NAMES[sortedDays[sortedDays.length - 1]]}`;
  }
  
  return sortedDays.map(d => DAY_NAMES[d]).join(', ');
}

export function getHelpMenu(
  senderName?: string, 
  managerName?: string,
  config?: { effectiveDays: number[]; effectiveHourStart: string; effectiveHourEnd: string } | null
): string {
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

  const formatTime = (t: string) => t.replace(/:/g, '.');
  const activeDaysStr = config?.effectiveDays ? formatEffectiveDays(config.effectiveDays) : 'Sabtu - Kamis';
  const activeHoursStr = (config?.effectiveHourStart && config?.effectiveHourEnd)
    ? `${formatTime(config.effectiveHourStart)} - ${formatTime(config.effectiveHourEnd)}`
    : '07.00 - 21.00';

  return `╭─── o「 ${titleMain} 」o
│
├─── o(" ${titleUserInfo} ")
│ 👤 *${labelName}:* ${greetingName}${managerLine}
│
├─── o(" ${titleBotInfo} ")
├─✦ *${labelBotName}:* JustBot-Service
├─✦ *${labelEngine}:* Fastify & Groq AI
├─✦ *${labelActive}:* ${activeDaysStr}
├─✦ *${labelHours}:* ${activeHoursStr}
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
