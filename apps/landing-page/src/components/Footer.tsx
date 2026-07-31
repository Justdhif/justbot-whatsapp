import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Shield, FileText, X } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-[#010102] border-t border-[#23252a] pt-16 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#25D366]/40 shadow-lg shadow-[#25D366]/20 bg-[#0f1011]">
                <img src="/justbot-avatar.jpg" alt="JustBot Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-lg text-white">JustBot</span>
            </div>
            <p className="text-xs text-[#8a8f98] max-w-sm leading-relaxed">
              {t('footer.desc')}
            </p>

            {/* Subtle System Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0f1011] border border-[#23252a] text-[11px] font-mono text-[#8a8f98]">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span>{t('footer.status')}</span>
            </div>
          </div>

          {/* Bot Modules Links */}
          <div>
            <h4 className="text-xs font-mono text-white uppercase tracking-wider mb-4">{t('footer.colModules')}</h4>
            <ul className="space-y-2.5 text-xs text-[#8a8f98]">
              <li><a href="#features" className="hover:text-white transition-colors">Coding Assistant</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Finance Manager</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Content Creator</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Polyglot Translator</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">PDF & OCR AI</a></li>
            </ul>
          </div>

          {/* Interactive Navigation */}
          <div>
            <h4 className="text-xs font-mono text-white uppercase tracking-wider mb-4">{t('footer.colNav')}</h4>
            <ul className="space-y-2.5 text-xs text-[#8a8f98]">
              <li><a href="#features" className="hover:text-white transition-colors">{t('footer.modSpec')}</a></li>
              <li><a href="#demo" className="hover:text-white transition-colors">{t('footer.simSandbox')}</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">{t('footer.testimonials')}</a></li>
              <li>
                <a
                  href="https://wa.me/6282213111575?text=Halo%20JustBot%2C%20saya%20ingin%20mencoba%20bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors"
                >
                  {t('footer.contactAssist')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="text-xs font-mono text-white uppercase tracking-wider mb-4">{t('footer.colLegal')}</h4>
            <ul className="space-y-2.5 text-xs text-[#8a8f98]">
              <li>
                <a
                  href="#privacy"
                  onClick={(e) => {
                    if (window.location.pathname === '/') {
                      e.preventDefault();
                      setActiveModal('privacy');
                    }
                  }}
                  className="hover:text-white transition-colors text-left flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>{t('footer.privacy')}</span>
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  onClick={(e) => {
                    if (window.location.pathname === '/') {
                      e.preventDefault();
                      setActiveModal('terms');
                    }
                  }}
                  className="hover:text-white transition-colors text-left flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>{t('footer.terms')}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Subtle Links */}
        <div className="pt-8 border-t border-[#23252a] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#62666d]">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" onClick={() => setActiveModal('privacy')} className="hover:text-[#d0d6e0] transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="#terms" onClick={() => setActiveModal('terms')} className="hover:text-[#d0d6e0] transition-colors">
              {t('footer.terms')}
            </a>
          </div>
        </div>
      </div>

      {/* Privacy Policy / Terms Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f1011] border border-[#23252a] rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto relative shadow-2xl"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 p-2 text-[#8a8f98] hover:text-white bg-[#141516] rounded-lg border border-[#23252a] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {activeModal === 'privacy' ? (
                <div className="space-y-4 text-sm text-[#d0d6e0]">
                  <div className="flex items-center gap-2 text-[#25D366] font-mono text-xs mb-2">
                    <Shield className="w-4 h-4" /> LEGAL DOCUMENTATION
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Kebijakan Privasi (Privacy Policy)</h3>
                  <p className="text-xs text-[#8a8f98]">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>

                  <div className="space-y-3 text-xs leading-relaxed text-[#8a8f98]">
                    <p>
                      Selamat datang di <strong className="text-white">JustBot</strong>. Kami menghargai privasi data Anda dan berkomitmen untuk melindungi informasi pribadi yang dikirimkan melalui layanan bot WhatsApp kami.
                    </p>
                    <h4 className="font-semibold text-white text-sm pt-2">1. Pengumpulan Informasi</h4>
                    <p>
                      JustBot hanya memproses teks, pesan instruksi, atau naskah dokumen yang Anda kirimkan secara langsung saat berinteraksi dengan modul kami (seperti Coding Assistant, OCR Scan, PDF AI, dan Translator).
                    </p>
                    <h4 className="font-semibold text-white text-sm pt-2">2. Penggunaan Data</h4>
                    <p>
                      Data yang dikirimkan secara ketat hanya digunakan oleh modul AI untuk memberikan tanggapan balasan secara real-time. Kami tidak pernah menjual, menyewakan, atau membagikan data Anda kepada pihak ketiga.
                    </p>
                    <h4 className="font-semibold text-white text-sm pt-2">3. Keamanan Informasi</h4>
                    <p>
                      Semua pertukaran pesan dilakukan melalui enkripsi standar WhatsApp Cloud API dan diproses pada infrastruktur server yang aman.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm text-[#d0d6e0]">
                  <div className="flex items-center gap-2 text-[#25D366] font-mono text-xs mb-2">
                    <FileText className="w-4 h-4" /> LEGAL DOCUMENTATION
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Syarat & Ketentuan (Terms of Service)</h3>
                  <p className="text-xs text-[#8a8f98]">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>

                  <div className="space-y-3 text-xs leading-relaxed text-[#8a8f98]">
                    <p>
                      Dengan mengakses atau menggunakan bot <strong className="text-white">JustBot WhatsApp</strong>, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan penggunaan berikut.
                    </p>
                    <h4 className="font-semibold text-white text-sm pt-2">1. Penggunaan Layanan yang Diizinkan</h4>
                    <p>
                      Layanan ini disediakan untuk membantu produktivitas harian seperti analisis kode, penerjemahan bahasa, pemrosesan dokumen, dan pembuatan konten. Pengguna dilarang menggunakan bot untuk kegiatan ilegal, penipuan, maupun spamming.
                    </p>
                    <h4 className="font-semibold text-white text-sm pt-2">2. Ketersediaan Layanan (Uptime)</h4>
                    <p>
                      Kami berusaha menjaga ketersediaan bot 24/7. Namun, pemeliharaan sistem atau gangguan jaringan server WhatsApp dari Meta dapat memengaruhi waktu respon secara berkala.
                    </p>
                    <h4 className="font-semibold text-white text-sm pt-2">3. Batasan Tanggung Jawab</h4>
                    <p>
                      Tanggapan yang dihasilkan oleh modul AI (seperti saran finansial atau analisa kode) disediakan sebagai asistensi referensi. Pengguna bertanggung jawab penuh atas keputusan akhir yang diambil berdasarkan saran bot.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};
