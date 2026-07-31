import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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

export const FeaturesGrid: React.FC = () => {
  const { t } = useTranslation();

  const botModules = [
    {
      code: 'coding',
      name: t('features.coding.name'),
      icon: Code2,
      desc: t('features.coding.desc'),
      capabilities: [
        t('features.coding.cap1'),
        t('features.coding.cap2'),
        t('features.coding.cap3'),
      ],
      span: 'col-span-1 md:col-span-2',
      accent: 'from-blue-500/20 to-transparent',
    },
    {
      code: 'finance',
      name: t('features.finance.name'),
      icon: Wallet,
      desc: t('features.finance.desc'),
      capabilities: [
        t('features.finance.cap1'),
        t('features.finance.cap2'),
        t('features.finance.cap3'),
      ],
      span: 'col-span-1',
      accent: 'from-[#25D366]/20 to-transparent',
    },
    {
      code: 'creator',
      name: t('features.creator.name'),
      icon: Video,
      desc: t('features.creator.desc'),
      capabilities: [
        t('features.creator.cap1'),
        t('features.creator.cap2'),
        t('features.creator.cap3'),
      ],
      span: 'col-span-1',
      accent: 'from-purple-500/20 to-transparent',
    },
    {
      code: 'translator',
      name: t('features.translator.name'),
      icon: Globe,
      desc: t('features.translator.desc'),
      capabilities: [
        t('features.translator.cap1'),
        t('features.translator.cap2'),
        t('features.translator.cap3'),
      ],
      span: 'col-span-1 md:col-span-2',
      accent: 'from-teal-500/20 to-transparent',
    },
    {
      code: 'ocr',
      name: t('features.ocr.name'),
      icon: ScanText,
      desc: t('features.ocr.desc'),
      capabilities: [
        t('features.ocr.cap1'),
        t('features.ocr.cap2'),
        t('features.ocr.cap3'),
      ],
      span: 'col-span-1',
      accent: 'from-amber-500/20 to-transparent',
    },
    {
      code: 'pdf-ai',
      name: t('features.pdfAi.name'),
      icon: FileText,
      desc: t('features.pdfAi.desc'),
      capabilities: [
        t('features.pdfAi.cap1'),
        t('features.pdfAi.cap2'),
        t('features.pdfAi.cap3'),
      ],
      span: 'col-span-1',
      accent: 'from-emerald-500/20 to-transparent',
    },
    {
      code: 'reminder',
      name: t('features.reminder.name'),
      icon: Bell,
      desc: t('features.reminder.desc'),
      capabilities: [
        t('features.reminder.cap1'),
        t('features.reminder.cap2'),
        t('features.reminder.cap3'),
      ],
      span: 'col-span-1',
      accent: 'from-pink-500/20 to-transparent',
    },
    {
      code: 'email',
      name: t('features.email.name'),
      icon: Mail,
      desc: t('features.email.desc'),
      capabilities: [
        t('features.email.cap1'),
        t('features.email.cap2'),
        t('features.email.cap3'),
      ],
      span: 'col-span-1',
      accent: 'from-indigo-500/20 to-transparent',
    },
    {
      code: 'utilities',
      name: t('features.utilities.name'),
      icon: Wrench,
      desc: t('features.utilities.desc'),
      capabilities: [
        t('features.utilities.cap1'),
        t('features.utilities.cap2'),
        t('features.utilities.cap3'),
      ],
      span: 'col-span-1 md:col-span-2',
      accent: 'from-[#3ecf8e]/20 to-transparent',
    },
  ];

  return (
    <section id="features" className="py-24 bg-[#010102] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f1011] border border-[#23252a] text-xs font-mono text-[#25D366] mb-4">
            <Terminal className="w-3.5 h-3.5" /> {t('features.eyebrow')}
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('features.title1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d0d6e0] to-[#25D366]">
              {t('features.title2')}
            </span>
          </h2>
          <p className="mt-4 text-[#8a8f98] text-base sm:text-lg">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Bento Grid */}
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
