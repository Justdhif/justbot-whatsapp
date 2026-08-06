'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Bot, Loader2, CheckCircle2, QrCode, AlertCircle, RefreshCw, Mail, Lock, User, Phone, KeyRound, Eye, EyeOff } from 'lucide-react';
import { apiFetch, setAuthTokens, getAuthTokens } from '@/lib/api-client';

interface QrResponse {
  sessionId: string;
  qrLink: string;
}

export default function RegisterPage() {
  const router = useRouter();
  
  // Modes: 'register' | 'login'
  const [mode, setMode] = useState<'register' | 'login'>('register');
  // Login modes: 'qr' | 'manual'
  const [loginMode, setLoginMode] = useState<'qr' | 'manual'>('qr');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [qrData, setQrData] = useState<QrResponse | null>(null);
  const [qrStatus, setQrStatus] = useState<'pending' | 'approved' | 'expired' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Registration form input states
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);

  // OTP Verification States
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [regOtp, setRegOtp] = useState<string>('');
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);

  // Login form input states
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // OTP Countdown Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setTimeout(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  // Check if already logged in
  useEffect(() => {
    const { accessToken, refreshToken } = getAuthTokens();
    if (accessToken || refreshToken) {
      router.push('/dashboard');
    }
  }, [router]);

  const startPolling = useCallback((sessionId: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      try {
        const response = await apiFetch<{ status: string; tokens?: { accessToken: string; refreshToken: string } }>(
          `/auth/qr/status/${sessionId}`
        );
        
        const payload = (response as any).data || response;

        if (payload.status === 'approved' && payload.tokens) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setQrStatus('approved');
          setAuthTokens(payload.tokens.accessToken, payload.tokens.refreshToken);
          
          setTimeout(() => {
            router.push('/dashboard');
          }, 1200);
        } else if (payload.status === 'expired') {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setQrStatus('expired');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2500);
  }, [router]);

  const generateQR = useCallback(async () => {
    setLoading(true);
    setQrStatus('pending');
    setErrorMessage('');
    
    try {
      const response = await apiFetch<QrResponse>('/auth/qr/generate', { method: 'POST' });
      const payload = (response as any).data || response;
      
      setQrData(payload);
      startPolling(payload.sessionId);
    } catch (err: any) {
      console.error('Generate QR error:', err);
      setQrStatus('error');
      setErrorMessage(err.message || 'Gagal membuat QR Code login. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [startPolling]);

  // Load QR on component mount or switching to QR login
  useEffect(() => {
    if (mode === 'login' && loginMode === 'qr') {
      generateQR();
    } else {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    }
  }, [mode, loginMode, generateQR]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone.trim()) {
      setErrorMessage('Nomor WhatsApp wajib diisi.');
      return;
    }

    setOtpLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Menghapus semua karakter non-angka
      let cleanPhone = regPhone.trim().replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.substring(1);
      } else if (cleanPhone.startsWith('62')) {
        // sudah ada kode negara 62
      } else {
        cleanPhone = '62' + cleanPhone;
      }

      const response = await apiFetch<{ success: boolean }>('/auth/register/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: cleanPhone }),
      });

      const payload = (response as any).data || response;

      if (payload.success) {
        setIsOtpSent(true);
        setOtpCountdown(60);
        setSuccessMessage('Kode OTP berhasil dikirim ke WhatsApp Anda.');
      } else {
        setErrorMessage('Gagal mengirimkan kode OTP.');
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setErrorMessage(err.message || 'Nomor WhatsApp Anda sudah terdaftar atau tidak valid.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone.trim() || !regPassword || !regOtp.trim()) {
      setErrorMessage('Lengkapi nomor WhatsApp, kata sandi, dan kode OTP.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let cleanPhone = regPhone.trim().replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.substring(1);
      } else if (cleanPhone.startsWith('62')) {
        // sudah ada kode negara 62
      } else {
        cleanPhone = '62' + cleanPhone;
      }

      const bodyPayload = {
        displayName: regName.trim() || undefined,
        email: regEmail.trim() || undefined,
        phoneNumber: cleanPhone,
        password: regPassword,
        otpCode: regOtp.trim(),
      };

      const response = await apiFetch<{ accessToken: string; refreshToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(bodyPayload),
      });

      const payload = (response as any).data || response;

      if (payload.accessToken && payload.refreshToken) {
        setSuccessMessage('Pendaftaran berhasil! Mengarahkan ke dashboard...');
        setAuthTokens(payload.accessToken, payload.refreshToken);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } else {
        setErrorMessage('Gagal mendaftar akun baru.');
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setErrorMessage(err.message || 'Kode OTP salah atau nomor WhatsApp sudah terdaftar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMessage('Silakan isi seluruh kolom input.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const isEmail = loginIdentifier.includes('@');
      const bodyPayload = {
        email: isEmail ? loginIdentifier.trim() : undefined,
        phoneNumber: !isEmail ? loginIdentifier.trim() : undefined,
        password: loginPassword,
      };

      const response = await apiFetch<{ accessToken: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(bodyPayload),
      });

      const payload = (response as any).data || response;

      if (payload.accessToken && payload.refreshToken) {
        setSuccessMessage('Login berhasil! Mengarahkan ke dashboard...');
        setAuthTokens(payload.accessToken, payload.refreshToken);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } else {
        setErrorMessage('Gagal memperoleh token autentikasi.');
      }
    } catch (err: any) {
      console.error('Manual login error:', err);
      setErrorMessage(err.message || 'Kredensial salah atau akun dinonaktifkan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden px-4">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[420px] z-10">
        
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-11 w-11 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-900 flex items-center justify-center mb-3">
            <img src="/favicon.png" alt="JustBot Logo" className="h-8.5 w-8.5 object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            {mode === 'register' ? 'Daftar Akun Manager' : 'Masuk Akun Manager'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1 text-center">
            {mode === 'register' 
              ? 'Catat laporan keuangan dan simpan pengingat WhatsApp Anda'
              : 'Gunakan akun terdaftar Anda untuk mengakses laporan keuangan'
            }
          </p>
        </div>

        {/* Form Card */}
        <div className="glow-card rounded-2xl p-6 bg-zinc-950/80 backdrop-blur-md flex flex-col">
          
          {/* Status Notifications */}
          {errorMessage && (
            <div className="p-3 bg-red-950/20 border border-red-950 text-red-400 rounded-lg text-xs font-medium mb-4 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-900 text-emerald-400 rounded-lg text-xs font-medium mb-4 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}
          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={isOtpSent ? handleRegister : handleSendOtp} className="space-y-4">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Nama Tampilan (Display Name)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    disabled={isOtpSent || submitting || otpLoading}
                    placeholder="Contoh: Budi Santoso"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="pl-9 pr-3 h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Email (Opsional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    disabled={isOtpSent || submitting || otpLoading}
                    placeholder="budi@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="pl-9 pr-3 h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400">Nomor WhatsApp (Wajib)</label>
                  <span className="text-[10px] text-zinc-550 font-medium">Flag: +62 (Masukkan sisa angka)</span>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    disabled={isOtpSent || submitting || otpLoading}
                    placeholder="Contoh: 82211223344 atau 082211..."
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="pl-9 pr-3 h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Kata Sandi</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    disabled={isOtpSent || submitting || otpLoading}
                    placeholder="Minimal 8 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="pl-9 pr-10 h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={isOtpSent || submitting || otpLoading}
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none p-1 rounded hover:bg-zinc-900 transition-colors disabled:opacity-50"
                  >
                    {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* OTP Code (Only shown when OTP is sent) */}
              {isOtpSent && (
                <div className="space-y-1.5 border-t border-zinc-900 pt-4 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-white flex items-center gap-1">
                      <KeyRound className="h-3.5 w-3.5 text-zinc-400" /> Masukkan Kode OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 underline font-medium"
                    >
                      Ubah data
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="6-digit OTP"
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                      className="h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 text-center tracking-[0.5em] text-lg font-bold text-white placeholder:tracking-normal placeholder:text-zinc-700 placeholder:text-sm focus:outline-none focus:border-zinc-700 transition-colors font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-550 leading-relaxed">
                    Kode OTP dikirim langsung ke WhatsApp nomor Anda.
                  </p>
                  
                  {/* Resend OTP */}
                  <div className="flex justify-end pt-1">
                    {otpCountdown > 0 ? (
                      <span className="text-[11px] text-zinc-500 font-medium">
                        Kirim ulang OTP dalam {otpCountdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={otpLoading}
                        onClick={handleSendOtp}
                        className="text-[11px] text-white font-semibold hover:underline flex items-center gap-1"
                      >
                        {otpLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Kirim Ulang Kode OTP'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || otpLoading}
                className="w-full h-10 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                {otpLoading || submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isOtpSent ? (
                  'Verifikasi & Buat Akun'
                ) : (
                  'Kirim Kode OTP'
                )}
              </button>
            </form>
          )}

          {/* MODE: LOGIN (Fallback/Emergency) */}
          {mode === 'login' && (
            <div className="space-y-5">
              {/* Login Mode Selector */}
              <div className="flex justify-center gap-4 text-xs font-medium border-b border-zinc-900 pb-3.5">
                <button
                  onClick={() => {
                    setLoginMode('qr');
                    setErrorMessage('');
                  }}
                  className={`pb-1 transition-all relative ${
                    loginMode === 'qr' 
                      ? 'text-white font-semibold' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  WhatsApp QR
                  {loginMode === 'qr' && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full -mb-[15px]" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setLoginMode('manual');
                    setErrorMessage('');
                  }}
                  className={`pb-1 transition-all relative ${
                    loginMode === 'manual' 
                      ? 'text-white font-semibold' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Email / Sandi
                  {loginMode === 'manual' && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full -mb-[15px]" />
                  )}
                </button>
              </div>

              {/* MODE: WhatsApp QR Code */}
              {loginMode === 'qr' && (
                <div className="flex flex-col items-center">
                  {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
                      <p className="text-zinc-500 text-xs mt-3">Membuat sesi QR Code...</p>
                    </div>
                  ) : qrStatus === 'approved' ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                      <div className="h-14 w-14 bg-white/10 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">Login Berhasil</h3>
                      <p className="text-xs text-zinc-500 mt-1">Mengalihkan...</p>
                    </div>
                  ) : qrStatus === 'expired' ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <AlertCircle className="h-10 w-10 text-zinc-500 mb-3" />
                      <h3 className="text-sm font-semibold text-white">Sesi QR Kedaluwarsa</h3>
                      <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">
                        Sesi QR telah habis. Silakan segarkan untuk QR baru.
                      </p>
                      <button
                        onClick={generateQR}
                        className="mt-4 flex items-center gap-1.5 px-3 h-8.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Segarkan
                      </button>
                    </div>
                  ) : qrStatus === 'error' ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
                      <h3 className="text-sm font-semibold text-white">Gagal Memuat</h3>
                      <button
                        onClick={generateQR}
                        className="mt-4 flex items-center gap-1.5 px-3 h-8.5 rounded-lg bg-zinc-900 text-white border border-zinc-800 font-semibold text-xs hover:bg-zinc-800 transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Ulangi
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center">
                      {/* QR Frame */}
                      <div className="p-3.5 bg-white rounded-xl shadow-inner mb-5 relative">
                        {qrData && (
                          <a href={qrData.qrLink} target="_blank" rel="noopener noreferrer" title="Buka di WhatsApp langsung">
                            <QRCodeSVG 
                              value={qrData.qrLink}
                              size={170}
                              level="M"
                              className="cursor-pointer"
                            />
                          </a>
                        )}
                        <div className="absolute -bottom-1.5 -right-1.5 bg-zinc-950 border border-zinc-900 text-white rounded-lg p-1">
                          <QrCode className="h-3.5 w-3.5" />
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="text-left w-full space-y-2.5 text-xs text-zinc-400 mb-5">
                        <p className="flex gap-2">
                          <span className="h-4 w-4 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold flex items-center justify-center text-zinc-300">1</span>
                          <span>Pindai QR di atas lewat WA HP Anda, atau <a href={qrData?.qrLink} target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-semibold">klik tautan ini</a> jika di perangkat yang sama.</span>
                        </p>
                        <p className="flex gap-2">
                          <span className="h-4 w-4 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold flex items-center justify-center text-zinc-300">2</span>
                          <span>Kirim pesan otomatis berupa <code className="bg-zinc-900 border border-zinc-850 px-1 py-0.5 rounded text-white font-mono">.login [id]</code> ke Bot WhatsApp Anda.</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 py-1 border-t border-zinc-900/60 w-full justify-center">
                        <Loader2 className="h-2.5 w-2.5 animate-spin" /> Menunggu persetujuan bot...
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODE: Email / Password Traditional Login */}
              {loginMode === 'manual' && (
                <form onSubmit={handleManualLogin} className="space-y-4">
                  {/* Email / Phone field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Email atau Nomor HP</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: user@domain.com atau 628221..."
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="pl-9 pr-3 h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Kata Sandi</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-9 pr-10 h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none p-1 rounded hover:bg-zinc-900 transition-colors"
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-10 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 mt-2"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Masuk Dashboard'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Toggle mode button */}
          <div className="mt-5 text-center">
            <button
              onClick={() => {
                setMode(mode === 'register' ? 'login' : 'register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs text-zinc-400 hover:text-white transition-colors underline focus:outline-none"
            >
              {mode === 'register' 
                ? 'Sudah memiliki akun? Masuk ke Dashboard' 
                : 'Belum memiliki akun? Daftar Manager Baru'
              }
            </button>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-xs text-zinc-650 text-center mt-6">
          JustBot WhatsApp Bot Service © 2026.
        </p>

      </div>
    </div>
  );
}
