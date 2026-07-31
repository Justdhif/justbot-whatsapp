import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Shield, Lock, Eye, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] selection:bg-[#25D366]/30 selection:text-[#25D366]">
      <Navbar />

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#8a8f98] hover:text-[#25D366] mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Beranda</span>
        </a>

        {/* Header */}
        <div className="border-b border-[#23252a] pb-8 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f1011] border border-[#23252a] text-xs font-mono text-[#25D366] mb-4">
            <Shield className="w-3.5 h-3.5" /> Legal Documentation
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Kebijakan Privasi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d0d6e0] to-[#25D366]">
              (Privacy Policy)
            </span>
          </h1>
          <p className="mt-4 text-[#8a8f98] text-sm font-mono">
            Terakhir Diperbarui: 31 Juli 2026 • Berlaku untuk Semua Pengguna JustBot WA
          </p>
        </div>

        {/* Article Body */}
        <div className="space-y-10 text-sm leading-relaxed text-[#d0d6e0]">
          <section className="glass-panel p-6 rounded-2xl border border-[#23252a] space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#25D366]" /> Komitmen Privasi Kami
            </h2>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Di <strong>JustBot</strong>, kami menganggap privasi data pengguna sebagai prioritas tertinggi. Kebijakan Privasi ini menjelaskan jenis informasi yang kami kumpulkan saat Anda berinteraksi dengan layanan bot WhatsApp kami, serta bagaimana informasi tersebut digunakan, diproses, dan dilindungi.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">1. Informasi yang Kami Kumpulkan</h3>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              JustBot beroperasi secara pasif-responsif melalui platform WhatsApp. Informasi yang dapat diproses meliputi:
            </p>
            <ul className="space-y-2 text-xs text-[#d0d6e0] list-disc list-inside">
              <li><strong className="text-white">Pesan & Instruksi Input:</strong> Teks, pertanyaan, naskah dokumen, maupun cuplikan kode yang Anda kirimkan untuk diproses oleh modul AI (seperti Coding Assistant, Translator, atau OCR).</li>
              <li><strong className="text-white">Dokumen & Media:</strong> File PDF atau gambar scan struk yang diunggah secara spesifik untuk dianalisis oleh modul PDF AI atau OCR Scanner.</li>
              <li><strong className="text-white">Metadata Pesan:</strong> Informasi teknis dasar dari antarmuka WhatsApp Webhook (seperti ID sesi dan timestamps kirim).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">2. Cara Kami Menggunakan Informasi Anda</h3>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Informasi yang dikumpulkan digunakan secara eksklusif untuk tujuan berikut:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#0f1011] p-4 rounded-xl border border-[#23252a]">
                <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#25D366]" /> Pemrosesan Respon Real-Time
                </h4>
                <p className="text-[11px] text-[#8a8f98]">Menerjemahkan teks, menganalisis bug kode, atau merangkum PDF yang diunggah secara instan.</p>
              </div>
              <div className="bg-[#0f1011] p-4 rounded-xl border border-[#23252a]">
                <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#25D366]" /> Peningkatan Kualitas Modul
                </h4>
                <p className="text-[11px] text-[#8a8f98]">Memastikan akurasi respon bot dan mendeteksi adanya error teknis pada modul AI.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">3. Proteksi Data & Larangan Pihak Ketiga</h3>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Kami <strong className="text-white">TIDAK PERNAH</strong> menjual, menyewakan, memperdagangkan, atau membagikan data percakapan maupun informasi pribadi Anda kepada pihak ketiga untuk kepentingan periklanan maupun pemasaran. Pemrosesan kecerdasan buatan dilakukan melalui infrastruktur terenkripsi dan model AI terisolasi (Groq LLM Engine).
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">4. Keamanan Enkripsi</h3>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Semua komunikasi antara perangkat WhatsApp Anda dan server JustBot dilindungi oleh protokol enkripsi end-to-end resmi dari Meta WhatsApp Cloud API infrastructure.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">5. Hubungi Kami</h3>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau ingin mengajukan penghapusan data sesi, silakan hubungi tim dukungan kami melalui layanan bot WhatsApp interaktif.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
