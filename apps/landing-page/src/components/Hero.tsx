import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, MessageSquareText, CheckCircle2, Bot, Terminal, Zap, Code2 } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-36 pb-20 md:pt-48 md:pb-36 overflow-hidden bg-radial-glow">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#25D366]/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Linear Style Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0f1011] border border-[#23252a] text-xs font-mono text-[#25D366] mb-8 shadow-inner hover:border-[#25D366]/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>JustBot WA v2.0 Architecture Live</span>
            <span className="text-[#62666d]">|</span>
            <a href="https://wa.me/6282213111575" target="_blank" rel="noopener noreferrer" className="text-[#8a8f98] hover:text-white transition-colors flex items-center gap-1">
              Test on WhatsApp <ArrowRight className="w-3 h-3 inline" />
            </a>
          </motion.div>

          {/* Premium Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.08]"
          >
            Empower Your WhatsApp with <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#25D366] via-[#3ecf8e] to-emerald-300">
              Autonomous AI Intelligence
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-[#8a8f98] max-w-3xl font-normal leading-relaxed"
          >
            Satu asisten cerdas WhatsApp yang mengintegrasikan 9+ modul otomatisasi: pemrosesan dokumen PDF, OCR scan, bantuan coding, riset konten, hingga manajemen finansial 24/7.
          </motion.p>

          {/* Premium Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-black bg-[#25D366] hover:bg-[#3ecf8e] transition-all shadow-xl shadow-[#25D366]/25 hover:shadow-[#25D366]/40 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 group"
            >
              <MessageSquareText className="w-5 h-5 text-black" />
              <span>Explore Bot Modules</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-[#d0d6e0] bg-[#0f1011] hover:bg-[#141516] border border-[#23252a] hover:border-[#34343a] transition-all flex items-center justify-center gap-2"
            >
              <span>Try Live Simulator</span>
            </a>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-[#62666d] font-mono"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#25D366]" /> Instant WhatsApp Setup
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#25D366]" /> End-to-End Encryption
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#25D366]" /> Under 1.2s Response Rate
            </span>
          </motion.div>
        </div>

        {/* Hero Mockup Panel (Linear & Supabase Inspired Glass Frame) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-[#23252a] bg-[#0f1011]/90 shadow-2xl overflow-hidden p-2 sm:p-4 backdrop-blur-xl group hover:border-[#25D366]/30 transition-colors"
        >
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#23252a] bg-[#010102]/80 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs font-mono text-[#62666d] ml-2 flex items-center gap-1">
                <Terminal className="w-3 h-3 text-[#25D366]" /> justbot-wa-service.console
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#25D366]">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span>ACTIVE (+62 822-1311-1575)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {/* Left Metrics */}
            <div className="space-y-4">
              <div className="bg-[#141516] p-4 rounded-xl border border-[#23252a]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8a8f98] font-mono">Active Modules</span>
                  <Code2 className="w-4 h-4 text-[#25D366]" />
                </div>
                <div className="text-2xl font-bold text-white mt-1">9 Modules</div>
                <span className="text-xs text-[#25D366] font-mono">Coding, Finance, OCR, PDF, Email...</span>
              </div>
              <div className="bg-[#141516] p-4 rounded-xl border border-[#23252a]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8a8f98] font-mono">System Accuracy</span>
                  <Zap className="w-4 h-4 text-[#25D366]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#25D366] mt-1">99.2%</div>
                <span className="text-xs text-[#8a8f98]">Powered by Groq LLM & OCR Engine</span>
              </div>
            </div>

            {/* Right Live Simulated Session */}
            <div className="md:col-span-2 bg-[#010102] rounded-xl border border-[#23252a] p-4 flex flex-col justify-between space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-[#23252a] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
                  <span className="text-xs font-semibold text-white">JustBot WA Handler</span>
                </div>
                <span className="text-[10px] font-mono text-[#8a8f98]">Number: 82213111575</span>
              </div>

              {/* Chat snippet */}
              <div className="space-y-3 text-xs">
                <div className="bg-[#141516] p-3 rounded-xl border border-[#23252a] max-w-[85%] self-start text-[#d0d6e0]">
                  <p className="font-semibold text-[11px] text-[#8a8f98] mb-0.5">Pengguna WA</p>
                  Halo JustBot! Bisakah kamu bantu terjemahkan naskah ini ke Bahasa Inggris profesional dan cek kode error TypeScript saya?
                </div>
                <div className="bg-[#25D366]/10 border border-[#25D366]/30 p-3 rounded-xl max-w-[85%] ml-auto text-white">
                  <div className="flex items-center gap-1 text-[10px] text-[#25D366] font-mono mb-1">
                    <Sparkles className="w-3 h-3" /> JustBot AI (Modul Translator & Coding)
                  </div>
                  Tentu! Saya siap membantu. Kirimkan teks naskah dan potongan kode error Anda. Modul Polyglot & Coding Assistant akan segera memprosesnya dalam <span className="font-mono text-[#25D366]">1.2 detik</span>! 🚀
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
