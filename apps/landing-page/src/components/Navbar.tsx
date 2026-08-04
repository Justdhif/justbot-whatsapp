import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Menu, X, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'id' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#010102]/80 backdrop-blur-md border-b border-[#23252a] py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#25D366]/40 shadow-lg shadow-[#25D366]/20 group-hover:scale-105 transition-transform bg-[#0f1011]">
              <img src="/justbot-avatar.jpg" alt="JustBot Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white">
                JustBot
              </span>
              <span className="text-[10px] text-[#8a8f98] font-mono -mt-1">AI Automation</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8a8f98]">
            <a href="#features" className="hover:text-white transition-colors">{t('nav.botModules')}</a>
            <a href="#demo" className="hover:text-white transition-colors">{t('nav.liveSimulator')}</a>
            <a href="#testimonials" className="hover:text-white transition-colors">{t('nav.testimonials')}</a>
          </nav>

          {/* CTA Buttons & Language Switcher */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#23252a] bg-[#0f1011] hover:bg-[#141516] text-xs font-mono text-[#d0d6e0] transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#25D366]" />
              <span className="uppercase">{i18n.language.startsWith('en') ? 'EN' : 'ID'}</span>
            </button>

            <a
              href="#login"
              className="px-4 py-2 text-sm font-semibold text-[#8a8f98] hover:text-white transition-colors"
            >
              Login Web
            </a>

            <a
              href="https://wa.me/6282213111575?text=Halo%20JustBot%2C%20saya%20ingin%20mencoba%20bot%20WhatsApp%20AI"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-black bg-[#25D366] hover:bg-[#3ecf8e] transition-all shadow-md shadow-[#25D366]/20 hover:shadow-[#25D366]/40"
            >
              <span>{t('nav.getStarted')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Mobile Menu Toggle & Language Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#23252a] bg-[#0f1011] text-xs font-mono text-[#d0d6e0]"
            >
              <Globe className="w-3.5 h-3.5 text-[#25D366]" />
              <span className="uppercase">{i18n.language.startsWith('en') ? 'EN' : 'ID'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#8a8f98] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f1011] border-b border-[#23252a] px-4 pt-4 pb-6 mt-3 space-y-4">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#d0d6e0] hover:text-white"
          >
            {t('nav.botModules')}
          </a>
          <a
            href="#demo"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#d0d6e0] hover:text-white"
          >
            {t('nav.liveSimulator')}
          </a>
          <a
            href="#testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#d0d6e0] hover:text-white"
          >
            {t('nav.testimonials')}
          </a>
          <div className="pt-4 border-t border-[#23252a] flex flex-col gap-3">
            <a
              href="#login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-white/[0.04] border border-white/[0.08]"
            >
              Login Web
            </a>
            <a
              href="https://wa.me/6282213111575?text=Halo%20JustBot%2C%20saya%20ingin%20mencoba%20bot%20WhatsApp%20AI"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-black bg-[#25D366]"
            >
              {t('nav.getStarted')}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
