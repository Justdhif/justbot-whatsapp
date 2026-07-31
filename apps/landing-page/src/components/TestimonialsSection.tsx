import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star, MessageSquareQuote, ShieldCheck } from 'lucide-react';

const testimonials = [
  {
    name: 'Budi Santoso',
    role: 'Owner, Digital Shop ID',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    quote: 'JustBot mengubah cara toko kami melayani pelanggan. Modul Finance dan Coding AI-nya membantu tim saya menyelesaikan pesan orderan 10x lebih cepat!',
    rating: 5,
    tag: 'E-commerce Owner',
  },
  {
    name: 'Siti Rahmawati',
    role: 'Lead Content Strategist',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    quote: 'Modul Content Creator di JustBot luar biasa! Tinggal kirim topik di WA, bot langsung memberikan script naskah TikTok lengkap dengan hook 3 detik yang FYP.',
    rating: 5,
    tag: 'Agency Creator',
  },
  {
    name: 'Kevin Wijaya',
    role: 'Senior Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    quote: 'Integrasi modul PDF & OCR di JustBot WA sangat membantu analisa invoice dan dokumen kerja saya kapan saja di ponsel tanpa buka laptop.',
    rating: 5,
    tag: 'Developer User',
  },
  {
    name: 'Andi Pratama',
    role: 'Founder, EduTech Community',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    quote: 'Respon dari JustBot sangat alami dan cepat. Anggota komunitas kami terkesan karena pertanyaan umum selalu terjawab otomatis 24/7.',
    rating: 5,
    tag: 'Community Lead',
  },
  {
    name: 'Dewi Lestari',
    role: 'Operational Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    quote: 'Modul Translator & Executive Email di WA menghemat waktu kerja saya dalam menyusun draf email internasional hanya dalam hitungan detik.',
    rating: 5,
    tag: 'Executive User',
  },
  {
    name: 'Rian Hidayat',
    role: 'Freelance Tech Lead',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    quote: 'Awesome design! Antarmukanya bersih, modul AI di WA sangat responsif. Sangat direkomendasikan untuk siapa saja yang ingin automatisasi WA.',
    rating: 5,
    tag: 'Tech Enthusiast',
  },
];

export const TestimonialsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="testimonials" className="py-24 bg-[#010102] relative border-t border-[#23252a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f1011] border border-[#23252a] text-xs font-mono text-[#25D366] mb-4">
            <MessageSquareQuote className="w-3.5 h-3.5" /> {t('testimonials.eyebrow')}
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('testimonials.title1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d0d6e0] to-[#25D366]">
              {t('testimonials.title2')}
            </span>
          </h2>
          <p className="mt-4 text-[#8a8f98] text-base sm:text-lg">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, rIdx) => (
                      <Star key={rIdx} className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-[#8a8f98] bg-[#141516] px-2.5 py-1 rounded border border-[#23252a]">
                    {item.tag}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#d0d6e0] leading-relaxed italic mb-8">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#23252a]">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#25D366]/40"
                />
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1">
                    {item.name} <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
                  </h4>
                  <p className="text-[11px] text-[#8a8f98]">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
