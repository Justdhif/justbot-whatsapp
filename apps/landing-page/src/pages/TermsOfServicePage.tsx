import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FileText, CheckCircle2, AlertTriangle, Scale, ArrowLeft } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
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
            <FileText className="w-3.5 h-3.5" /> Legal Documentation
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Syarat & Ketentuan Layanan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d0d6e0] to-[#25D366]">
              (Terms of Service)
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
              <Scale className="w-5 h-5 text-[#25D366]" /> Penerimaan Syarat
            </h2>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Dengan mengakses, mengirimkan pesan, atau berinteraksi dengan platform bot <strong>JustBot WhatsApp</strong>, Anda secara otomatis menyatakan menyetujui dan terikat oleh Syarat dan Ketentuan berikut.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">1. Penggunaan Layanan yang Diizinkan</h3>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              JustBot menyediakan asisten AI serbaguna (modul Coding, Finance, Content Creator, Translator, OCR, PDF AI, Reminder, Email) untuk mendukung efisiensi kerja harian Anda. Pengguna wajib mematuhi aturan penggunaan berikut:
            </p>
            <ul className="space-y-2 text-xs text-[#d0d6e0] list-disc list-inside">
              <li>Dilarang menggunakan bot untuk menyebarkan pesan massal spammings, konten berbahaya, ilegal, atau melanggar hukum yang berlaku di Indonesia.</li>
              <li>Dilarang melakukan reverse engineering, ekploitasi kelemahan teknis, atau percobaan peretasan pada API JustBot.</li>
              <li>Menghormati batas rate limit penggunaan pesan otomatis agar layanan tetap stabil bagi seluruh pengguna.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">2. Hak Kekayaan Intelektual</h3>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Semua kode sumber, desain antarmuka, modul, dan merek dagang <strong>JustBot</strong> adalah milik eksklusif pengembang. Hasil karya teks atau output kode yang dihasilkan AI saat diproses berdasarkan prompt Anda sepenuhnya menjadi hak milik Anda.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">3. Penolakan Jaminan & Batasan Tanggung Jawab</h3>
            <div className="bg-[#0f1011] p-5 rounded-2xl border border-[#23252a] space-y-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Sifat Output AI
              </h4>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Tanggapan yang dihasilkan oleh kecerdasan buatan (seperti estimasi kalkulasi finansial, terjemahan bahasa, atau rekomendasi perbaikan kode) bersifat sebagai rekomendasi pembantu. Pengguna diharapkan tetap melakukan verifikasi mandiri sebelum mengambil keputusan krusial.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">4. Ketersediaan Layanan (Uptime)</h3>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Kami berupaya mempertahankan ketersediaan bot 24/7. Namun, pemeliharaan rutin server, pembaruan API Meta WhatsApp Cloud, atau kendala jaringan pihak ketiga dapat menyebabkan penghentian sementara tanpa pemberitahuan sebelumnya.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">5. Perubahan Ketentuan</h3>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              JustBot berhak untuk mengubah atau memperbarui Syarat & Ketentuan ini sewaktu-waktu. Perubahan akan langsung berlaku setelah diunggah pada halaman ini.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
