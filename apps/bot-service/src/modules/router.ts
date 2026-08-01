import { handleFinanceModule } from './finance/finance.handler.js';
import { handleCreatorModule } from './creator/creator.handler.js';
import { handlePdfAiModule } from './pdf-ai/pdf-ai.handler.js';
import { handleOcrModule } from './ocr/ocr.handler.js';
import { handleCodingModule } from './coding/coding.handler.js';
import { handleTranslatorModule } from './translator/translator.handler.js';
import { handleReminderModule } from './reminder/reminder.handler.js';
import { handleEmailModule } from './email/email.handler.js';
import { handleUtilitiesModule, getHelpMenu } from './utilities/utilities.handler.js';
import { getUserSession } from '../utils/session.js';
import { askGroqAI } from '../services/groq.service.js';


export function isJuliaQuery(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes('jujul') || lower.includes('julia') || lower.includes('irya') || lower.includes('salsabillah');
}

export async function handleJuliaSpecialResponse(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 💖 *SPECIAL HEARTFUL ASSISTANT* di JustBot.
Tugas Anda memberikan tanggapan pengenalan yang SANGAT ROMANTIS, PENUH PUJIAN, DAN MENYENTUH HATI tentang sosok istimewa bernama *Julia Irya Salsabillah* (yang akrab dipanggil *Jujul*).

Fakta & Poin Penting Wajib yang Harus Disampaikan dengan Bahasa Indah & Puitis:
1. *Nama Lengkap*: Julia Irya Salsabillah (Jujul).
2. *Tanggal Lahir*: 16 Juli 2009.
3. *Pendidikan saat ini*: SMKN 5 Balikpapan, Kalimantan Timur.
4. *Poin Utama*: Dia adalah sosok perempuan luar biasa, indah, dan berharga yang selalu dibanggakan dan dikagumi oleh sang developer (Nadhif).

Gunakan emoji romantis (🌸 💖 ✨ 👑 🌹), pembatas garis puitis (══════════════════════), dan nada bicara yang elegan, manis, serta menyentuh hati.`;

  return await askGroqAI(userPrompt, systemPrompt);
}


export const MODULE_DETAILS: Record<string, { name: string; icon: string; desc: string; capabilities: string[] }> = {
  coding: {
    name: 'Coding Assistant',
    icon: '💻',
    desc: 'Mode khusus pemrograman, refactoring, debug error & arsitektur software.',
    capabilities: [
      'Menulis & melengkapi kode (TS, JS, Python, Go, dll)',
      'Menganalisis & membenarkan error / bug',
      'Refactoring kode agar lebih bersih & optimal',
    ],
  },
  finance: {
    name: 'Finance Consultant',
    icon: '💰',
    desc: 'Mode khusus konsultasi keuangan pribadi, perencanaan anggaran, tips hemat, & investasi.',
    capabilities: [
      'Menyusun perencanaan anggaran (budgeting 50/30/20)',
      'Saran investasi cerdas & alokasi aset',
      'Tips praktis menghemat pengeluaran bulanan',
    ],
  },
  creator: {
    name: 'Content Creator',
    icon: '🎥',
    desc: 'Mode khusus ide konten viral, script video pendek & strategi media sosial.',
    capabilities: [
      'Merancang script naskah TikTok/Reels/Shorts',
      'Rekomendasi hook 3 detik pertama yang memikat',
      'Riset hashtag & strategi konten FYP',
    ],
  },
  translate: {
    name: 'Polyglot Translator',
    icon: '🌍',
    desc: 'Mode penerjemahan kontekstual alami antar berbagai bahasa dunia.',
    capabilities: [
      'Terjemahan akurat kontekstual (Indo, Eng, JP, CN, dll)',
      'Penjelasan nuansa bahasa & frasa lokal',
      'Pemeriksaan tata bahasa terjemahan',
    ],
  },
  ocr: {
    name: 'OCR Scanner',
    icon: '📷',
    desc: 'Mode pengolahan & perapihan teks dari hasil scan gambar / struk.',
    capabilities: [
      'Merapikan teks berantakan hasil scan OCR',
      'Mengekstrak poin-poin dari dokumen digital',
      'Menyusun format tabel dari struk pembayaran',
    ],
  },
  pdf: {
    name: 'PDF & Document AI',
    icon: '📄',
    desc: 'Mode bedah dokumen, ringkasan eksekutif & tanya jawab berkas.',
    capabilities: [
      'Merangkum naskah/makalah panjang menjadi poin penting',
      'Menjawab pertanyaan seputar isi dokumen',
      'Ekstraksi kesimpulan utama dokumen',
    ],
  },
  email: {
    name: 'Executive Email',
    icon: '📧',
    desc: 'Mode penyusunan draf email profesional & surat resmi.',
    capabilities: [
      'Draf email izin sakit / cuti / lamaran kerja',
      'Email negosiasi bisnis & follow up klien',
      'Mengubah teks biasa menjadi bahasa resmi korporat',
    ],
  },
  reminder: {
    name: 'Agenda & Reminder',
    icon: '📅',
    desc: 'Mode pengatur agenda, to-do list harian & estimasi waktu.',
    capabilities: [
      'Membuat jadwal harian & daftar tugas terstruktur',
      'Pengelompokkan prioritas agenda kerja',
      'Estimasi alokasi waktu kegiatan',
    ],
  },

  cuanbuddy: {
    name: 'CuanBuddy App',
    icon: '💳',
    desc: 'Modul Integrasi dan Sinkronisasi Catatan Transaksi Otomatis Ke Aplikasi Keuangan CuanBuddy.',
    capabilities: [
      'Integrasi realtime nomor WhatsApp via 6-digit OTP',
      'Pencatatan pengeluaran dan pendapatan otomatis langsung dari obrolan',
      'Sinkronisasi dashboard data transaksi keuangan terpadu',
    ],
  },
};

export async function processIncomingMessage(userId: string, text: string, senderName?: string): Promise<string> {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  
  if (isJuliaQuery(trimmed)) {
    return await handleJuliaSpecialResponse(trimmed);
  }

  const session = getUserSession(userId);

  
  if (session.activeMode) {
    const currentMode = session.activeMode;

    switch (currentMode) {
      case 'coding':
        return await handleCodingModule(trimmed);
      case 'finance':
        return await handleFinanceModule(trimmed, userId, senderName);
      case 'creator':
        return await handleCreatorModule(trimmed);
      case 'translate':
        return await handleTranslatorModule(trimmed);
      case 'ocr':
        return await handleOcrModule(trimmed);
      case 'pdf':
        return await handlePdfAiModule(trimmed);
      case 'email':
        return await handleEmailModule(trimmed);
      case 'reminder':
        return await handleReminderModule(trimmed);
      default:
        break;
    }
  }

  
  
  
  if (lower.startsWith('.util')) {
    return await handleUtilitiesModule(trimmed.replace(/^\.util\s*/i, ''));
  }
  
  
  
  const isMathExpression = /^[0-9+\-*/().\s]+$/.test(trimmed) && trimmed.length > 2;
  if (isMathExpression) {
    return await handleUtilitiesModule(trimmed);
  }
  
  
  

  
  if (/^\d{6}$/.test(trimmed)) {
    return await handleFinanceModule(trimmed, userId, senderName);
  }

  
  const namePrompt = senderName ? `Nama profil WhatsApp pengguna ini adalah "${senderName}". Sapa atau panggil namanya bila sesuai agar percakapan terasa personal.` : '';

  const conversationalSystemPrompt = `Anda adalah 🤖 *JustBot AI*, asisten pintar WhatsApp yang sangat ramah, responsif, santai, cerdas, dan menyenangkan.
${namePrompt}

Aturan Penting:
1. Jawablah pesan pengguna secara LANGSUNG, ALAMI, DAN INTERAKTIF layaknya teman ngobrol yang asik di WhatsApp.
2. Tanggapi dengan gaya santai namun sopan, gunakan emoji yang cocok (seperti 😭, ✌️, 😊, 🤖, ✨).
3. Jika pengguna menyapa kasual (seperti 'p', 'halo', 'oi'), langsung sapa balik dengan hangat dan panggil nama profilnya bila ada!
4. Jika pengguna bertanya dengan konteks mengenai kemampuan Anda ("kamu bisa apa aja", "fitur apa aja", "tolong sebutkan kemampuanmu", "kamu bisa bantu apa", dll), jawab secara kasual dan TAMBAHKAN instruksi jelas/ajakan agar pengguna mengetik perintah \`.menu\` untuk melihat modul layanan lengkap secara detail.`;

  return await askGroqAI(trimmed, conversationalSystemPrompt);
}
