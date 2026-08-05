'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Bot, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  CalendarDays,
  ShieldAlert
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface BotConfig {
  id: string;
  effectiveDays: number[];
  effectiveHourStart: string;
  effectiveHourEnd: string;
  isMaintenance: boolean;
  timezone: string;
  customWelcomeMessage: string | null;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [configId, setConfigId] = useState<string>('');
  
  // Form State
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);
  const [hourStart, setHourStart] = useState<string>('08:00');
  const [hourEnd, setHourEnd] = useState<string>('17:00');
  const [timezone, setTimezone] = useState<string>('Asia/Jakarta');
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const daysOfWeek = [
    { label: 'Senin', value: 1 },
    { label: 'Selasa', value: 2 },
    { label: 'Rabu', value: 3 },
    { label: 'Kamis', value: 4 },
    { label: 'Jumat', value: 5 },
    { label: 'Sabtu', value: 6 },
    { label: 'Minggu', value: 7 },
  ];

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await apiFetch<{ data: BotConfig }>('/bot-configurations');
        const payload = (res as any).data || res;
        
        if (payload) {
          setConfigId(payload.id);
          setIsMaintenance(payload.isMaintenance);
          setHourStart(payload.effectiveHourStart || '08:00');
          setHourEnd(payload.effectiveHourEnd || '17:00');
          setTimezone(payload.timezone || 'Asia/Jakarta');
          setWelcomeMessage(payload.customWelcomeMessage || '');
          setSelectedDays(payload.effectiveDays || [1, 2, 3, 4, 5]);
        }
      } catch (err) {
        console.error('Error loading configuration:', err);
        setErrorMsg('Gagal memuat konfigurasi bot.');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleDayToggle = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(d => d !== dayValue) 
        : [...prev, dayValue].sort()
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await apiFetch('/bot-configurations', {
        method: 'PATCH',
        body: JSON.stringify({
          effectiveDays: selectedDays,
          effectiveHourStart: hourStart,
          effectiveHourEnd: hourEnd,
          isMaintenance,
          timezone,
          customWelcomeMessage: welcomeMessage.trim() || null
        })
      });

      setSuccessMsg('Konfigurasi bot berhasil diperbarui!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Error updating config:', err);
      // Give readable error message based on response status (403 Forbidden)
      if (err.message?.includes('Forbidden') || err.message?.includes('Unauthorized')) {
        setErrorMsg('Hanya Admin atau Super Admin yang dapat memperbarui pengaturan bot.');
      } else {
        setErrorMsg(err.message || 'Gagal memperbarui konfigurasi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
        <p className="text-zinc-500 text-sm mt-3">Memuat konfigurasi...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-zinc-400" /> Pengaturan WhatsApp Bot
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Sesuaikan waktu aktif, timezone, status maintenance, dan pesan sambutan bot.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900 text-emerald-400 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/20 border border-red-900 text-red-400 rounded-xl text-sm font-medium flex items-start gap-2">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" /> 
          <div>
            <p className="font-semibold">Terjadi Kendala</p>
            <p className="text-xs text-red-400/90 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Settings Form Card */}
      <div className="glow-card rounded-xl p-6 md:p-8 bg-zinc-950/20">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Maintenance Toggle */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bot className="h-4.5 w-4.5 text-zinc-400" /> Status Operasional
            </h3>
            
            <div className="flex items-start gap-4 p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
              <input
                type="checkbox"
                id="maintenance-toggle"
                checked={isMaintenance}
                onChange={(e) => setIsMaintenance(e.target.checked)}
                className="mt-1 h-4 w-4 bg-black border-zinc-900 text-white rounded focus:ring-0 cursor-pointer"
              />
              <div className="space-y-1">
                <label htmlFor="maintenance-toggle" className="text-sm font-medium text-white cursor-pointer select-none">
                  Mode Pemeliharaan (Maintenance Mode)
                </label>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Jika diaktifkan, Bot WhatsApp tidak akan menanggapi perintah pengguna luar (selain admin) dan akan membalas dengan status pemeliharaan.
                </p>
              </div>
            </div>
          </div>

          {/* Time & Timezone Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-zinc-400" /> Waktu Kerja Harian
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Mulai Jam</label>
                <input
                  type="text"
                  required
                  placeholder="08:00"
                  value={hourStart}
                  onChange={(e) => setHourStart(e.target.value)}
                  className="h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 px-3 text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Selesai Jam</label>
                <input
                  type="text"
                  required
                  placeholder="17:00"
                  value={hourEnd}
                  onChange={(e) => setHourEnd(e.target.value)}
                  className="h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 px-3 text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Timezone</label>
                <input
                  type="text"
                  required
                  placeholder="Asia/Jakarta"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 px-3 text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
                />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Bot hanya merespons chat di luar jam kerja jika dalam mode darurat. Gunakan format jam <code className="text-zinc-400">HH:MM</code>.
            </p>
          </div>

          {/* Workdays Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CalendarDays className="h-4.5 w-4.5 text-zinc-400" /> Hari Aktif Bot
            </h3>

            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const active = selectedDays.includes(day.value);
                return (
                  <button
                    type="button"
                    key={day.value}
                    onClick={() => handleDayToggle(day.value)}
                    className={`h-9 px-4 rounded-lg text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-white border-white text-black font-bold shadow'
                        : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-zinc-500">
              Bot akan mengabaikan perintah otomatis dari pengguna umum di luar hari kerja yang diaktifkan di atas.
            </p>
          </div>

          {/* Welcome Message Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bot className="h-4.5 w-4.5 text-zinc-400" /> Pesan Sambutan Kustom
            </h3>
            
            <div className="space-y-1.5">
              <textarea
                placeholder="Tulis pesan sambutan bot kustom..."
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={4}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-900 p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 resize-none leading-relaxed font-sans"
              />
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Pesan ini akan dikirim secara otomatis oleh bot saat pengguna pertama kali mengetik perintah <code className="text-zinc-400">.start</code> atau menyapa bot.
            </p>
          </div>

          {/* Save Button */}
          <div className="border-t border-zinc-900 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 h-10 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4.5 w-4.5" />
              )}
              Simpan Perubahan
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
