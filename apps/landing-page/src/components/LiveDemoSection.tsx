import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Sparkles, CheckCheck } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const LiveDemoSection: React.FC = () => {
  const { t } = useTranslation();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'bot',
      text: t('demo.initialBotMsg'),
      time: '10:42 AM',
    },
  ]);

  const samplePrompts = [
    t('demo.prompt1'),
    t('demo.prompt2'),
    t('demo.prompt3'),
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

    setTimeout(() => {
      let botResponse = t('demo.initialBotMsg');
      const lower = text.toLowerCase();

      if (lower.includes('harga') || lower.includes('cost') || lower.includes('paket')) {
        botResponse = 'JustBot WA terintegrasi langsung dengan nomor +62 822-1311-1575. Coba modul gratis sekarang!';
      } else if (lower.includes('broadcast') || lower.includes('massal')) {
        botResponse = 'Fitur Broadcast JustBot dilengkapi anti-ban interval protection, personalisasi nama pelanggan, & CTA buttons!';
      } else if (lower.includes('modul') || lower.includes('ai') || lower.includes('coba')) {
        botResponse = 'Ketik kata kunci seperti `coding`, `finance`, `pdf`, atau `translator` di WA untuk langsung mengaktifkan modul!';
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
              <Sparkles className="w-3.5 h-3.5" /> {t('demo.eyebrow')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t('demo.title1')} <br />
              <span className="text-[#25D366]">{t('demo.title2')}</span>
            </h2>
            <p className="text-[#8a8f98] text-base leading-relaxed">
              {t('demo.subtitle')}
            </p>

            {/* Quick Prompt Suggestions */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-[#62666d]">{t('demo.exampleLabel')}</span>
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
              <div className="bg-[#128C7E] px-4 py-3 rounded-t-2xl flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-white/30 shrink-0">
                    <img src="/justbot-avatar.jpg" alt="JustBot Profile" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold leading-tight">{t('demo.headerTitle')}</h4>
                    <p className="text-[10px] text-white/80 font-mono">{t('demo.headerStatus')}</p>
                  </div>
                </div>
              </div>

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
                    <span className="ml-1 text-[10px]">{t('demo.typingText')}</span>
                  </div>
                )}
              </div>

              <div className="bg-[#1f2c34] p-2.5 rounded-b-2xl flex items-center gap-2 border-t border-white/5">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('demo.inputPlaceholder')}
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
