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

  // If the user is in an active transactional sync mode (e.g. CuanBuddy transaction recording mode)
  if (session.activeMode === 'finance') {
    return await handleFinanceModule(trimmed, userId, senderName);
  }

  // 1. CODING SKILL: Detect coding questions, code snippets, bugs, or program refactoring
  const isCodingQuery = 
    /\b(code|coding|program|function|compile|debug|error|typescript|javascript|python|html|css|json|refactor|database|git)\b/i.test(lower) ||
    /({[\s\S]*\}|=>|const |let |var |import |def |class )/.test(trimmed);
  if (isCodingQuery) {
    return await handleCodingModule(trimmed);
  }

  // 2. CREATOR SKILL: Detect tiktok, reels, video script, hook, content writing, social media content ideas
  const isCreatorQuery = /\b(tiktok|reels|shorts|konten|creator|hook|script|naskah|fyps|hashtag|caption|video)\b/i.test(lower);
  if (isCreatorQuery) {
    return await handleCreatorModule(trimmed);
  }

  // 3. TRANSLATOR SKILL: Detect translate, terjemahkan, kamus, or requests in foreign languages
  const isTranslatorQuery = /\b(terjemahkan|translate|artinya|inggris|jepang|mandarin|bahasa|polyglot)\b/i.test(lower);
  if (isTranslatorQuery) {
    return await handleTranslatorModule(trimmed);
  }

  // 4. OCR SKILL: Detect requests to scan, extract text from image context
  const isOcrQuery = /\b(ocr|scan|ekstrak|baca gambar|salin tulisan)\b/i.test(lower);
  if (isOcrQuery) {
    return await handleOcrModule(trimmed);
  }

  // 5. PDF SKILL: Detect pdf, summary, document analysis requests
  const isPdfQuery = /\b(pdf|dokumen|rangkum|baca berkas|summary|ringkas)\b/i.test(lower);
  if (isPdfQuery) {
    return await handlePdfAiModule(trimmed);
  }

  // 6. EMAIL SKILL: Detect requests to write emails, formal letters, cuti, application drafts
  const isEmailQuery = /\b(email|surel|surat resmi|draf surat|izin cuti|lamaran kerja|formal draft)\b/i.test(lower);
  if (isEmailQuery) {
    return await handleEmailModule(trimmed);
  }

  // 7. REMINDER SKILL: Detect task manager, todo list, schedules, reminders, agendas
  const isReminderQuery = /\b(reminder|jadwal|agenda|todo|catatan kerja|tugas hari ini|prioritas)\b/i.test(lower);
  if (isReminderQuery) {
    return await handleReminderModule(trimmed);
  }

  // 8. UTILITIES SKILL: Detect calculations, unit conversions, math, fact-finding queries
  const isUtilityQuery = 
    /^[0-9+\-*/().\s]+$/.test(trimmed) && trimmed.length > 2 || 
    /\b(konversi|hitung|berapa|kurangi|tambah|kali|bagi|kilo|mil|celcius|fahrenheit|usd|rupiah|idr|kurs|meter|cm|luas|volume|ibukota|tanggal|sejarah)\b/i.test(lower);
  if (isUtilityQuery) {
    return await handleUtilitiesModule(trimmed);
  }

  // Handle 6-digit OTP verification codes (independent app pairing flow)
  if (/^\d{6}$/.test(trimmed)) {
    return await handleFinanceModule(trimmed, userId, senderName);
  }

  // Default Chatbot conversational response
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
