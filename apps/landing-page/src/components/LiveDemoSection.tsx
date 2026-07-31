import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, CheckCheck } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const LiveDemoSection: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Halo! Selamat datang di JustBot WhatsApp Demo. Silakan coba tanyakan tentang fitur, harga, atau cara integrasi!',
      time: '10:42 AM',
    },
  ]);

  const samplePrompts = [
    'Berapa harga paket JustBot?',
    'Apakah JustBot bisa broadcast WA massal?',
    'Cara daftar uji coba gratis 14 hari?',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // Simulate AI bot response delay
    setTimeout(() => {
      let botResponse = 'Tentu! JustBot siap membantu bisnis Anda beroperasi 24/7 di WhatsApp dengan fitur AI auto-reply cerdas!';
      const lower = text.toLowerCase();

      if (lower.includes('harga') || lower.includes('paket')) {
        botResponse = 'JustBot menyediakan paket Starter mulai Rp 199rb/bln, Pro Rp 499rb/bln, dan Enterprise untuk skala besar. Semua paket termasuk trial gratis 14 hari!';
      } else if (lower.includes('broadcast') || lower.includes('massal')) {
        botResponse = 'Sangat bisa! Fitur Broadcast JustBot dilengkapi anti-ban interval protection, personalisasi nama pelanggan, dan tombol interaktif (CTA buttons)!';
      } else if (lower.includes('daftar') || lower.includes('trial') || lower.includes('coba')) {
        botResponse = 'Anda bisa mendaftar gratis tanpa kartu kredit! Cukup klik tombol "Get Started" di bagian atas halaman ini untuk langsung mengaktifkan akun.';
      }

      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <section id="demo" className="py-24 bg-[#010102] border-t border-[#23252a] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f1011] border border-[#23252a] text-xs font-mono text-[#25D366]">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Sandbox
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Test JustBot AI Live <br />
              <span className="text-[#25D366]">Right in Your Browser</span>
            </h2>
            <p className="text-[#8a8f98] text-base leading-relaxed">
              Experience the ultra-fast reaction time and natural conversational capability of JustBot trained for WhatsApp customer service.
            </p>

            {/* Quick Prompt Suggestions */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-[#62666d]">CLICK TO TRY EXAMPLE PROMPTS:</span>
              <div className="flex flex-col gap-2">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="text-left text-xs bg-[#0f1011] hover:bg-[#141516] border border-[#23252a] hover:border-[#25D366]/50 text-[#d0d6e0] px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group"
                  >
                    <span>"{prompt}"</span>
                    <Send className="w-3 h-3 text-[#25D366] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Phone Mockup Column */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-md bg-[#0f1011] border border-[#23252a] rounded-3xl p-3 shadow-2xl relative overflow-hidden">
              {/* Phone Top Notch Bar */}
              <div className="bg-[#128C7E] px-4 py-3 rounded-t-2xl flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-white/30 shrink-0">
                    <img src="/justbot-avatar.jpg" alt="JustBot Profile" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold leading-tight">JustBot Official Assistant</h4>
                    <p className="text-[10px] text-white/80 font-mono">online • AI Auto-Responder</p>
                  </div>
                </div>
              </div>

              {/* Chat Canvas Area */}
              <div className="bg-[#0b141a] p-4 h-96 overflow-y-auto space-y-3 flex flex-col scrollbar-thin">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#005c4b] text-white self-end rounded-tr-none'
                        : 'bg-[#202c33] text-[#e9edef] self-start rounded-tl-none border border-white/5'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-white/60">
                      <span>{msg.time}</span>
                      {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-[#53bdeb]" />}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="bg-[#202c33] text-white/70 text-xs px-3 py-2 rounded-xl self-start flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1 text-[10px]">JustBot is typing...</span>
                  </div>
                )}
              </div>

              {/* Input Footer */}
              <div className="bg-[#1f2c34] p-2.5 rounded-b-2xl flex items-center gap-2 border-t border-white/5">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ketik pesan..."
                  className="flex-1 bg-[#2a3942] text-white text-xs px-3 py-2.5 rounded-lg outline-none placeholder:text-white/40 focus:ring-1 focus:ring-[#25D366]"
                />
                <button
                  onClick={() => handleSend()}
                  className="w-9 h-9 rounded-lg bg-[#25D366] hover:bg-[#3ecf8e] text-black flex items-center justify-center transition-colors shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
