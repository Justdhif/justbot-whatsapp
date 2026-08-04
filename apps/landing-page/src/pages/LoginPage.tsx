import React, { useState, useEffect } from 'react';
import { QrCode, MessageSquare, ShieldCheck, Loader2, ArrowLeft, RefreshCw, LogOut, CheckCircle2, User } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  phoneNumber: string;
  displayName?: string;
}

export function LoginPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrLink, setQrLink] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'pending' | 'approved' | 'expired' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const API_URL = 'https://justbot-api.netlify.app';

  // Cek jika sudah login sebelumnya
  useEffect(() => {
    const savedToken = localStorage.getItem('justbot_access_token');
    if (savedToken) {
      fetchUserProfile(savedToken);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      setStatus('loading');
      // Ambil profile info (misal dari endpoint me atau endpoint user profile)
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data?.data || data);
        setToken(authToken);
        setIsLoggedIn(true);
        setStatus('approved');
      } else {
        // Token expired/invalid
        handleLogout();
      }
    } catch (err) {
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('justbot_access_token');
    setIsLoggedIn(false);
    setUserProfile(null);
    setToken(null);
    setStatus('idle');
  };

  // Generate QR Session
  const generateQr = async () => {
    try {
      setStatus('loading');
      setErrorMessage('');
      const res = await fetch(`${API_URL}/api/auth/qr/generate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Gagal membuat sesi QR');
      const data = await res.json();
      
      const { sessionId: sId, qrLink: qLink } = data?.data || data;
      setSessionId(sId);
      setQrLink(qLink);
      setStatus('pending');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Koneksi ke backend bermasalah.');
    }
  };

  // Polling status QR
  useEffect(() => {
    if (status !== 'pending' || !sessionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/qr/status/${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();
        
        const resData = data?.data || data;
        
        if (resData.status === 'approved' && resData.tokens?.accessToken) {
          clearInterval(interval);
          const accessToken = resData.tokens.accessToken;
          localStorage.setItem('justbot_access_token', accessToken);
          fetchUserProfile(accessToken);
        } else if (resData.status === 'expired') {
          clearInterval(interval);
          setStatus('expired');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000); // Poll setiap 2 detik

    return () => clearInterval(interval);
  }, [status, sessionId]);

  // Back to Landing Page
  const goBack = () => {
    window.location.hash = '';
    window.location.pathname = '/';
  };

  // Tautan WA me untuk manual click di HP
  const handleOpenWhatsApp = () => {
    if (qrLink) {
      window.open(qrLink, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] flex flex-col font-sans selection:bg-[#25D366]/30 selection:text-[#25D366]">
      {/* Background Gradient Decorative */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#25D366]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/[0.04] backdrop-blur-md sticky top-0 z-50">
        <button 
          onClick={goBack}
          className="flex items-center gap-2 text-sm text-[#8a8f98] hover:text-white transition-colors duration-200"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-white via-[#8a8f98] to-[#4e525a] bg-clip-text text-transparent">JUSTBOT</span>
          <span className="bg-[#25D366]/10 text-[#25D366] text-[10px] px-2 py-0.5 rounded-full font-medium border border-[#25D366]/20">WEB</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        
        {/* LOGGED IN VIEW */}
        {isLoggedIn && userProfile ? (
          <div className="w-full max-w-md bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#25D366] to-emerald-500" />
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#25D366]/10 border border-[#25D366]/20 rounded-full flex items-center justify-center text-[#25D366] mb-6 shadow-[0_0_20px_rgba(37,211,102,0.1)]">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Login Berhasil!</h2>
              <p className="text-sm text-[#8a8f98] mb-8">Selamat datang kembali di dashboard utama JustBot.</p>
              
              {/* Profile Card */}
              <div className="w-full bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 mb-8 text-left">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-white/[0.04] border border-white/[0.06] rounded-full flex items-center justify-center text-[#8a8f98]">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-[#8a8f98]">Nama Panggilan</div>
                    <div className="font-semibold text-white">{userProfile.displayName || 'WhatsApp User'}</div>
                  </div>
                </div>
                <div className="border-t border-white/[0.04] pt-4 flex flex-col gap-3">
                  <div>
                    <div className="text-xs text-[#8a8f98]">Nomor WhatsApp</div>
                    <div className="text-sm font-mono text-white">+{userProfile.phoneNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#8a8f98]">Email Akun</div>
                    <div className="text-sm text-white">{userProfile.email}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-medium rounded-2xl transition-all duration-200"
              >
                <LogOut size={18} /> Keluar dari Sesi
              </button>
            </div>
          </div>
        ) : (
          /* LOGIN PROMPT / QR GENERATOR VIEW */
          <div className="w-full max-w-xl bg-white/[0.01] border border-white/[0.04] rounded-3xl p-8 md:p-12 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Kiri: Deskripsi Langkah */}
              <div className="md:col-span-7 flex flex-col justify-center">
                <h1 className="text-3xl font-bold tracking-tight mb-3">Login Instan via WhatsApp</h1>
                <p className="text-sm text-[#8a8f98] mb-6 leading-relaxed">
                  Tidak perlu email dan password. Cukup scan kode QR menggunakan kamera HP atau kirimkan pesan login yang otomatis disiapkan.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-white/[0.04] border border-white/[0.06] rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">1</div>
                    <p className="text-xs text-[#8a8f98] leading-relaxed">Scan QR Code di layar, atau klik tombol <b>Hubungkan WhatsApp</b> jika kamu membukanya dari HP.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-white/[0.04] border border-white/[0.06] rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">2</div>
                    <p className="text-xs text-[#8a8f98] leading-relaxed">Pesan otomatis berisi kode login unik akan terisi di chat WA Anda. Kirim pesan tersebut.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-white/[0.04] border border-white/[0.06] rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">3</div>
                    <p className="text-xs text-[#8a8f98] leading-relaxed">Web frontend akan otomatis mendeteksi persetujuan dan langsung me-redirect ke Dashboard Anda.</p>
                  </div>
                </div>
              </div>

              {/* Kanan: QR Code Box */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="w-[210px] h-[210px] bg-white/[0.02] border border-white/[0.06] rounded-2xl flex flex-col items-center justify-center p-3 relative overflow-hidden shadow-inner">
                  
                  {/* Status: Loading */}
                  {status === 'loading' && (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={32} className="animate-spin text-[#25D366]" />
                      <span className="text-[11px] text-[#8a8f98]">Membuat sesi...</span>
                    </div>
                  )}

                  {/* Status: Idle / Awal */}
                  {status === 'idle' && (
                    <button 
                      onClick={generateQr}
                      className="flex flex-col items-center gap-3 text-center group"
                    >
                      <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center text-[#25D366] group-hover:scale-105 transition-transform duration-200">
                        <QrCode size={24} />
                      </div>
                      <span className="text-xs font-medium text-white">Generate QR Code</span>
                    </button>
                  )}

                  {/* Status: Pending (QR Ready) */}
                  {status === 'pending' && qrLink && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrLink)}&color=000&bgcolor=fff`}
                        alt="WhatsApp Login QR Code"
                        className="w-full h-full object-contain rounded-lg border border-white/[0.04] p-1 bg-white"
                      />
                    </div>
                  )}

                  {/* Status: Expired */}
                  {status === 'expired' && (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <span className="text-xs text-red-400 font-semibold">QR Kedaluwarsa</span>
                      <button 
                        onClick={generateQr}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] rounded-xl text-[11px] font-medium text-white transition-colors"
                      >
                        <RefreshCw size={12} /> Regenerate
                      </button>
                    </div>
                  )}

                  {/* Status: Error */}
                  {status === 'error' && (
                    <div className="flex flex-col items-center gap-2 text-center p-3">
                      <span className="text-xs text-red-400 font-semibold">Gagal Memuat</span>
                      <p className="text-[9px] text-[#8a8f98] line-clamp-2">{errorMessage}</p>
                      <button 
                        onClick={generateQr}
                        className="mt-1 px-2.5 py-1 bg-white/[0.04] rounded-lg text-[10px] text-white"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  )}

                </div>

                {status === 'pending' && (
                  <button 
                    onClick={handleOpenWhatsApp}
                    className="mt-4 w-full py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-[0_4px_12px_rgba(37,211,102,0.2)]"
                  >
                    <MessageSquare size={14} /> Hubungkan WhatsApp
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/[0.02] text-center text-xs text-[#4e525a]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShieldCheck size={14} className="text-[#25D366]" />
          <span>Koneksi terenkripsi aman</span>
        </div>
        <div>&copy; {new Date().getFullYear()} JustBot. All rights reserved.</div>
      </footer>
    </div>
  );
}
