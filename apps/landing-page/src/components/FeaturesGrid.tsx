import React from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Wallet,
  Video,
  Globe,
  ScanText,
  FileText,
  Bell,
  Mail,
  Wrench,
  Sparkles,
  Terminal,
} from 'lucide-react';

const botModules = [
  {
    code: 'coding',
    name: 'Coding Assistant Module',
    icon: Code2,
    desc: 'Mode khusus pemrograman, refactoring, debug error & analisa arsitektur software langsung via pesan WA.',
    capabilities: [
      'Menulis & melengkapi kode (TS, JS, Python, Go)',
      'Debug & penjelasan pesan error',
      'Refactoring kode lebih bersih & efisien',
    ],
    span: 'col-span-1 md:col-span-2',
    accent: 'from-blue-500/20 to-transparent',
  },
  {
    code: 'finance',
    name: 'Finance Manager Module',
    icon: Wallet,
    desc: 'Manajemen keuangan, budgeting 50/30/20, pencatatan transaksi & saran investasi.',
    capabilities: [
      'Perencanaan penganggaran gaji & tabungan',
      'Kalkulasi investasi tingkat dasar',
      'Tips hemat & alokasi finansial',
    ],
    span: 'col-span-1',
    accent: 'from-[#25D366]/20 to-transparent',
  },
  {
    code: 'creator',
    name: 'Content Creator Module',
    icon: Video,
    desc: 'Riset ide konten viral, naskah script video pendek (Reels/TikTok) & hook 3 detik pertama.',
    capabilities: [
      'Script naskah TikTok / Reels / Shorts',
      'Rekomendasi hook memikat',
      'Riset hashtag & strategi FYP',
    ],
    span: 'col-span-1',
    accent: 'from-purple-500/20 to-transparent',
  },
  {
    code: 'translator',
    name: 'Polyglot Translator Module',
    icon: Globe,
    desc: 'Terjemahan kontekstual alami antar berbagai bahasa dunia lengkap dengan penjelasan tata bahasa.',
    capabilities: [
      'Terjemahan akurat kontekstual multi-bahasa',
      'Penjelasan frasa lokal & idioms',
      'Pemeriksaan tata bahasa terjemahan',
    ],
    span: 'col-span-1 md:col-span-2',
    accent: 'from-teal-500/20 to-transparent',
  },
  {
    code: 'ocr',
    name: 'OCR Scanner Module',
    icon: ScanText,
    desc: 'Pengolahan & ekstraksi teks otomatis dari scan gambar, foto dokumen, maupun struk belanja.',
    capabilities: [
      'Merapikan teks berantakan hasil scan OCR',
      'Mengekstrak poin penting foto dokumen',
      'Menyusun format tabel dari struk',
    ],
    span: 'col-span-1',
    accent: 'from-amber-500/20 to-transparent',
  },
  {
    code: 'pdf-ai',
    name: 'PDF & Document AI Module',
    icon: FileText,
    desc: 'Bedah berkas PDF/dokumen panjang, buat ringkasan eksekutif & tanya-jawab isi naskah.',
    capabilities: [
      'Rangkuman naskah/makalah panjang',
      'Tanya jawab seputar isi dokumen PDF',
      'Ekstraksi kesimpulan utama dokumen',
    ],
    span: 'col-span-1',
    accent: 'from-emerald-500/20 to-transparent',
  },
  {
    code: 'reminder',
    name: 'Reminder & Schedule Module',
    icon: Bell,
    desc: 'Pengingat otomatis agenda harian, reminder tugas, dan jadwal penting langsung di WhatsApp.',
    capabilities: [
      'Pengesetan reminder fleksibel via kata kunci',
      'Notifikasi pengingat tepat waktu',
      'Manajemen agenda kegiatan harian',
    ],
    span: 'col-span-1',
    accent: 'from-pink-500/20 to-transparent',
  },
  {
    code: 'email',
    name: 'Executive Email Module',
    icon: Mail,
    desc: 'Penyusunan draf email profesional, balasan formal bisnis & naskah korespondensi resmi.',
    capabilities: [
      'Penyusunan draf email bisnis profesional',
      'Penyesuaian tone & formality level',
      'Template surat resmi & proposal',
    ],
    span: 'col-span-1',
    accent: 'from-indigo-500/20 to-transparent',
  },
  {
    code: 'utilities',
    name: 'Utilities & General AI',
    icon: Wrench,
    desc: 'Asisten serba bisa untuk kalkulasi, informasi cepat, cuaca, dan perintah bantuan serbaguna.',
    capabilities: [
      'Menu bantuan cepat & panduan modul',
      'Pencarian info umum & kalkulasi kilat',
      'Integrasi percakapan AI serbaguna',
    ],
    span: 'col-span-1 md:col-span-2',
    accent: 'from-[#3ecf8e]/20 to-transparent',
  },
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-[#010102] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f1011] border border-[#23252a] text-xs font-mono text-[#25D366] mb-4">
            <Terminal className="w-3.5 h-3.5" /> Core Bot Service Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Powered by Specialized <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d0d6e0] to-[#25D366]">
              WhatsApp AI Modules
            </span>
          </h2>
          <p className="mt-4 text-[#8a8f98] text-base sm:text-lg">
            Setiap modul dirancang secara modular di dalam `bot-service` untuk menangani kebutuhan spesifik Anda dengan akurasi & respon instan.
          </p>
        </div>

        {/* Bento Grid for Bot Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {botModules.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`glass-panel glass-panel-hover p-8 rounded-2xl relative overflow-hidden group ${item.span}`}
              >
                {/* Top Glow Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#141516] border border-[#23252a] flex items-center justify-center text-[#25D366] group-hover:scale-110 group-hover:border-[#25D366]/40 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#25D366] bg-[#25D366]/10 px-2.5 py-1 rounded border border-[#25D366]/20">
                    mod_{item.code}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-[#25D366] transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#8a8f98] leading-relaxed mb-6">
                  {item.desc}
                </p>

                {/* Capabilities list */}
                <div className="space-y-2 pt-4 border-t border-[#23252a]/60">
                  {item.capabilities.map((cap, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2 text-xs text-[#d0d6e0]">
                      <Sparkles className="w-3 h-3 text-[#25D366] shrink-0" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
