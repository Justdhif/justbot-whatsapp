import {
  sendWhatsAppMessage,
  sendWhatsAppButtons,
  sendWhatsAppCtaUrlButton,
} from '../../infrastructure/gateways/whatsapp.gateway.js';
import {
  setUserActiveMode,
} from '../../infrastructure/store/session.store.js';
import {
  resolveAccessToken,
} from '../../infrastructure/gateways/api-client.gateway.js';

export type OnAuthSuccess = (token: string) => Promise<void>;

export async function sendRegisterPrompt(from: string): Promise<void> {
  const welcomeText =
    `╭────────────────────────────\n` +
    `│  ⚠️ *AKUN BELUM TERDAFTAR* ⚠️\n` +
    `╰────────────────────────────\n` +
    `Halo! Kamu belum terdaftar di JustBot.\n\n` +
    `Untuk menggunakan layanan asisten personal (Catat Keuangan & Pengingat), silakan daftarkan akun Manager Anda terlebih dahulu.\n\n` +
    `Setelah sukses mendaftar, akun Anda akan otomatis terhubung dan aktif! 🚀`;

  await sendWhatsAppCtaUrlButton(
    from,
    welcomeText,
    'Daftar Sekarang',
    'https://justbot-manager.netlify.app/register',
    '⚠️ LOGIN DIPERLUKAN',
  );
}

export async function ensureAuthenticated(
  from: string,
  senderName: string,
  activeMode: string,
  onAuth: (token: string) => Promise<void>,
): Promise<void> {
  const token = await resolveAccessToken(from, senderName);
  if (token) {
    await onAuth(token);
  } else {
    setUserActiveMode(from, activeMode);
    await sendRegisterPrompt(from);
  }
}
