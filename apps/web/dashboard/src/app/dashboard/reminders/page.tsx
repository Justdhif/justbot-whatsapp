'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface Reminder {
  id: string;
  title: string;
  remindAt: string;
  isSent: boolean;
}

export default function RemindersPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDate, setFormDate] = useState<string>('');
  const [formTime, setFormTime] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadReminders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Reminder[]>('/reminders');
      
      const payload = (res as any).data || res;
      setReminders(payload || []);
    } catch (err) {
      console.error('Error loading reminders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setErrorMsg('Isi deskripsi agenda/pengingat');
      return;
    }
    if (!formDate || !formTime) {
      setErrorMsg('Pilih tanggal dan waktu pengingat');
      return;
    }

    const remindDateTime = new Date(`${formDate}T${formTime}`);
    if (remindDateTime <= new Date()) {
      setErrorMsg('Waktu pengingat harus berada di masa mendatang');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await apiFetch('/reminders', {
        method: 'POST',
        body: JSON.stringify({
          title: formTitle.trim(),
          remindAt: remindDateTime.toISOString()
        })
      });

      
      setFormTitle('');
      setFormDate('');
      setFormTime('');
      setShowAddModal(false);
      await loadReminders();
    } catch (err: any) {
      console.error('Error adding reminder:', err);
      setErrorMsg(err.message || 'Gagal menyimpan pengingat');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!confirm('Hapus pengingat ini?')) return;

    try {
      await apiFetch(`/reminders/${id}`, { method: 'DELETE' });
      await loadReminders();
    } catch (err) {
      console.error('Error deleting reminder:', err);
      alert('Gagal menghapus pengingat');
    }
  };

  
  const getRemainingTime = (remindAtStr: string) => {
    const diffMs = new Date(remindAtStr).getTime() - new Date().getTime();
    if (diffMs <= 0) return 'Sudah terlewat';
    
    const diffMin = Math.floor(diffMs / 1000 / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `Dalam ${diffDays} hari lagi`;
    if (diffHours > 0) return `Dalam ${diffHours} jam lagi`;
    return `Dalam ${diffMin} menit lagi`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-2.5">
            <Clock className="h-7 w-7 text-zinc-400" /> Pengingat Agenda
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Jadwalkan pengingat otomatis ke WhatsApp Anda. Bot akan mengirim pesan sesuai jadwal.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors shrink-0"
        >
          <Plus className="h-4.5 w-4.5" /> Tambah Pengingat
        </button>
      </div>

      {}
      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-zinc-900 rounded-xl max-w-2xl mx-auto">
          <Calendar className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
          <p className="text-sm text-zinc-400">Belum ada pengingat aktif dijadwalkan.</p>
          <p className="text-xs text-zinc-500 mt-1">Gunakan tombol di atas untuk membuat jadwal pengingat baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reminders.map((rem) => (
            <div 
              key={rem.id} 
              className="glow-card rounded-xl p-5 bg-zinc-950/40 flex flex-col justify-between h-[160px]"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-sm font-medium text-white line-clamp-2 leading-relaxed">
                    {rem.title}
                  </h3>
                  <button
                    onClick={() => handleDeleteReminder(rem.id)}
                    className="text-zinc-500 hover:text-red-500 p-1 rounded hover:bg-red-950/10 transition-colors shrink-0"
                    title="Hapus Agenda"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-3 mt-4 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-zinc-400">
                    {new Date(rem.remindAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(rem.remindAt).toLocaleDateString('id-ID', { weekday: 'long' })}
                  </span>
                </div>
                <span className="font-semibold text-white px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px]">
                  {getRemainingTime(rem.remindAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glow-card rounded-2xl w-full max-w-md bg-zinc-950 p-6 space-y-6 relative animate-in zoom-in duration-300">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors p-1"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div>
              <h3 className="text-lg font-semibold text-white">Buat Pengingat Baru</h3>
              <p className="text-xs text-zinc-500 mt-1">Bot akan mengirim pesan WhatsApp pada waktu yang ditentukan.</p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/20 border border-red-900 text-red-400 rounded-lg text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddReminder} className="space-y-4">
              {}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Agenda / Pesan Pengingat</label>
                <textarea
                  required
                  placeholder="Contoh: Rapat kerja bulanan dengan tim marketing atau Minum obat sore"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-900 p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 resize-none leading-relaxed"
                />
              </div>

              {}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 px-3 text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Waktu</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 px-3 text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
                  />
                </div>
              </div>

              {}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-10 rounded-lg bg-zinc-900 text-white border border-zinc-800 font-semibold text-sm hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-10 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Jadwalkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
