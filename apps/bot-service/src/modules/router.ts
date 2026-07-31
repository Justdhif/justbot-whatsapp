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

// Special easter egg prompt for Julia Irya Salsabillah (Jujul)
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

// Module metadata for preview info
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
    name: 'Finance Manager (CuanBuddy)',
    icon: '💰',
    desc: 'Mode khusus manajemen keuangan & pencatatan transaksi terintegrasi CuanBuddy App.',
    capabilities: [
      'Menghubungkan akun CuanBuddy via 6-digit OTP',
      'Pencatatan pengeluaran & pemasukan otomatis',
      'Perencanaan penganggaran gaji (50/30/20) & investasi',
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
  util: {
    name: 'Smart Utilities',
    icon: '🛠️',
    desc: 'Mode kalkulasi cepat, konversi satuan & pengetahuan umum.',
    capabilities: [
      'Kalkulasi matematis & logika cepat',
      'Konversi satuan/mata uang',
      'Jawaban pertanyaan umum serbaguna',
    ],
  },
};

export async function processIncomingMessage(userId: string, text: string, senderName?: string): Promise<string> {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // Check if message is asking about Julia / Jujul
  if (isJuliaQuery(trimmed)) {
    return await handleJuliaSpecialResponse(trimmed);
  }

  const session = getUserSession(userId);

  // Check if user is in an active mode session
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
      case 'util':
        return await handleUtilitiesModule(trimmed);
      default:
        break;
    }
  }

  // Handle explicit one-shot prefix commands if not in active mode (e.g. .finance, .coding)
  if (lower.startsWith('.finance')) return await handleFinanceModule(trimmed.replace(/^\.finance\s*/i, ''), userId, senderName);
  if (lower.startsWith('.creator')) return await handleCreatorModule(trimmed.replace(/^\.creator\s*/i, ''));
  if (lower.startsWith('.pdf')) return await handlePdfAiModule(trimmed.replace(/^\.pdf\s*/i, ''));
  if (lower.startsWith('.ocr')) return await handleOcrModule(trimmed.replace(/^\.ocr\s*/i, ''));
  if (lower.startsWith('.coding')) return await handleCodingModule(trimmed.replace(/^\.coding\s*/i, ''));
  if (lower.startsWith('.translate')) return await handleTranslatorModule(trimmed.replace(/^\.translate\s*/i, ''));
  if (lower.startsWith('.reminder')) return await handleReminderModule(trimmed.replace(/^\.reminder\s*/i, ''));
  if (lower.startsWith('.email')) return await handleEmailModule(trimmed.replace(/^\.email\s*/i, ''));
  if (lower.startsWith('.util')) return await handleUtilitiesModule(trimmed.replace(/^\.util\s*/i, ''));

  // Check 6-digit OTP code attempt even outside finance mode
  if (/^\d{6}$/.test(trimmed)) {
    return await handleFinanceModule(trimmed, userId, senderName);
  }

  // Intelligent Conversational AI Fallback with WhatsApp Profile Name Injection!
  const namePrompt = senderName ? `Nama profil WhatsApp pengguna ini adalah "${senderName}". Sapa atau panggil namanya bila sesuai agar percakapan terasa personal.` : '';

  const conversationalSystemPrompt = `Anda adalah 🤖 *JustBot AI*, asisten pintar WhatsApp yang sangat ramah, responsif, santai, cerdas, dan menyenangkan.
${namePrompt}

Aturan Penting:
1. Jawablah pesan pengguna secara LANGSUNG, ALAMI, DAN INTERAKTIF layaknya teman ngobrol yang asik di WhatsApp.
2. Tanggapi dengan gaya santai namun sopan, gunakan emoji yang cocok (seperti 😭, ✌️, 😊, 🤖, ✨).
3. Jika pengguna menyapa kasual (seperti 'p', 'halo', 'oi'), langsung sapa balik dengan hangat dan panggil nama profilnya bila ada!`;

  return await askGroqAI(trimmed, conversationalSystemPrompt);
}
