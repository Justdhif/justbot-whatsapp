'use client';

import Link from 'next/link';
import { Bot, CheckCircle2, MessageSquare } from 'lucide-react';

export default function RegisterSuccessPage() {
  const botPhone = process.env.NEXT_PUBLIC_BOT_PHONE_NUMBER || '';
  const waLink = botPhone ? `https://wa.me/${botPhone}` : 'https://wa.me/';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center relative">
        {}
        <div className="mb-8 relative">
          <div className="h-20 w-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg shadow-primary/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Bot className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-black rounded-full p-1 border border-zinc-900">
            <div className="bg-primary/20 p-1.5 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {}
        <h1 className="text-2xl font-bold tracking-tight text-white mb-3">
          Pendaftaran Berhasil!
        </h1>
        
        {}
        <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-sm">
          Akun Manager Anda telah terdaftar dan terhubung secara otomatis ke asisten personal WhatsApp JustBot.
        </p>

        {}
        <div className="w-full border-t border-zinc-800/60 my-6" />

        {}
        <div className="w-full text-left bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-4 mb-8">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Langkah Selanjutnya</h3>
          <p className="text-zinc-300 text-xs leading-relaxed">
            Anda dapat langsung menggunakan seluruh modul (Catat Keuangan & Pengingat) dengan mengetik perintah seperti <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono font-medium text-[11px]">.menu</code> atau <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono font-medium text-[11px]">.manager</code> di chat WhatsApp.
          </p>
        </div>

        {}
        <Link 
          href={waLink}
          className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 group shadow-md shadow-primary/10 active:scale-[0.98]"
        >
          <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          Mulai Chat WhatsApp
        </Link>
      </div>
    </div>
  );
}
