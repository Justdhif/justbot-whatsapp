import { handleFinanceModule } from './finance/finance.handler.js';
import { handleCreatorModule } from './creator/creator.handler.js';
import { handlePdfAiModule } from './pdf-ai/pdf-ai.handler.js';
import { handleOcrModule } from './ocr/ocr.handler.js';
import { handleCodingModule } from './coding/coding.handler.js';
import { handleTranslatorModule } from './translator/translator.handler.js';
import { handleReminderModule } from './reminder/reminder.handler.js';
import { handleEmailModule } from './email/email.handler.js';
import { handleUtilitiesModule, getHelpMenu } from './utilities/utilities.handler.js';
import { askGroqAI } from '../services/groq.service.js';
import { getUserSession, setUserActiveMode } from '../utils/session.js';

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
    name: 'Finance Manager',
    icon: '💰',
    desc: 'Mode khusus manajemen keuangan, budgeting 50/30/20, & saran investasi.',
    capabilities: [
      'Perencanaan penganggaran gaji & alokasi tabungan',
      'Perhitungan & kalkulasi investasi tingkat dasar',
      'Pencatatan pengeluaran & tips hemat finansial',
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

export async function processIncomingMessage(userId: string, text: string): Promise<string> {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const session = getUserSession(userId);

  // Check if user is in an active mode session
  if (session.activeMode) {
    const currentMode = session.activeMode;

    switch (currentMode) {
      case 'coding':
        return await handleCodingModule(trimmed);
      case 'finance':
        return await handleFinanceModule(trimmed);
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

  // Handle explicit one-shot prefix commands if not in active mode
  if (lower.startsWith('!finance')) return await handleFinanceModule(trimmed.replace(/^!finance\s*/i, ''));
  if (lower.startsWith('!creator')) return await handleCreatorModule(trimmed.replace(/^!creator\s*/i, ''));
  if (lower.startsWith('!pdf')) return await handlePdfAiModule(trimmed.replace(/^!pdf\s*/i, ''));
  if (lower.startsWith('!ocr')) return await handleOcrModule(trimmed.replace(/^!ocr\s*/i, ''));
  if (lower.startsWith('!coding')) return await handleCodingModule(trimmed.replace(/^!coding\s*/i, ''));
  if (lower.startsWith('!translate')) return await handleTranslatorModule(trimmed.replace(/^!translate\s*/i, ''));
  if (lower.startsWith('!reminder')) return await handleReminderModule(trimmed.replace(/^!reminder\s*/i, ''));
  if (lower.startsWith('!email')) return await handleEmailModule(trimmed.replace(/^!email\s*/i, ''));
  if (lower.startsWith('!util')) return await handleUtilitiesModule(trimmed.replace(/^!util\s*/i, ''));

  // Fallback to General AI Assistant
  const generalSystemPrompt = `Anda adalah 🤖 *JUSTBOT GENERAL AI ASSISTANT*. Berikan respon yang ramah, efisien, bermakna, dan rapi menggunakan emojifikasi serta pembatas garis estetik di WhatsApp.`;
  return await askGroqAI(trimmed, generalSystemPrompt);
}
