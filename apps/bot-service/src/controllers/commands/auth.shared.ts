import {
  sendWhatsAppMessage,
  sendWhatsAppButtons,
} from '../../infrastructure/gateways/whatsapp.gateway.js';
import {
  setPendingAction,
  setUserActiveMode,
} from '../../infrastructure/store/session.store.js';
import {
  registerUserWithName,
  resolveAccessToken,
} from '../../infrastructure/gateways/api-client.gateway.js';
import { logger } from '../../utils/logger.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OnAuthSuccess = (token: string) => Promise<void>;

// ─── Register Prompt ──────────────────────────────────────────────────────────

/**
 * Tampilkan prompt daftar akun JustBot secara general.
 * Digunakan oleh semua modul yang membutuhkan autentikasi.
 */
export async function sendRegisterPrompt(from: string): Promise<void> {
  const welcomeText =
    `╭────────────────────────────\n` +
    `│  🤖 *JUSTBOT ACCOUNT* 🤖\n` +
    `╰────────────────────────────\n` +
    `Halo! Kamu belum memiliki akun JustBot.\n\n` +
    `Dengan mendaftar, kamu bisa mengakses:\n` +
    `├─✦ 💰 Finance Manager\n` +
    `├─✦ 🔔 Reminder Pintar\n` +
    `╰────────────────────────────\n` +
    `Tap tombol di bawah untuk mulai daftar! 👇`;

  await sendWhatsAppButtons(
    from,
    welcomeText,
    [{ id: 'auth:register', title: '📝 Daftar Sekarang' }],
    '🤖 SELAMAT DATANG',
  );
}

// ─── Name Input Handler ───────────────────────────────────────────────────────

/**
 * Proses input nama dari user, daftarkan akun, lalu panggil onSuccess.
 * Dipanggil ketika pendingAction === 'awaiting:register:name'.
 */
export async function handleNameRegistration(
  from: string,
  nameInput: string,
  senderName: string,
  onSuccess: (displayName: string) => Promise<void>,
): Promise<boolean> {
  const displayName = nameInput.trim();

  if (!displayName || displayName.length < 2 || displayName.length > 50) {
    await sendWhatsAppMessage(
      from,
      `❌ Nama tidak valid. Masukkan nama panggilan 2–50 karakter.\n\nContoh: \`Nadhif\` atau \`Budi Santoso\``,
    );
    return true;
  }

  if (/[<>{}[\]\\|^~`]/.test(displayName)) {
    await sendWhatsAppMessage(from, `❌ Nama mengandung karakter yang tidak diperbolehkan. Coba lagi.`);
    return true;
  }

  await sendWhatsAppMessage(from, `⏳ Mendaftarkan akun atas nama *${displayName}*...`);

  try {
    const registered = await registerUserWithName(from, displayName);
    if (!registered) {
      await sendWhatsAppMessage(
        from,
        `❌ Gagal mendaftarkan akun. Coba lagi beberapa saat.`,
      );
      setPendingAction(from, null);
      return true;
    }

    // Login otomatis setelah register
    const token = await resolveAccessToken(from, displayName);
    if (!token) {
      await sendWhatsAppMessage(
        from,
        `⚠️ Akun berhasil dibuat, tapi gagal login otomatis. Coba lagi dengan mengirim perintah yang sama.`,
      );
      setPendingAction(from, null);
      return true;
    }

    setPendingAction(from, null);

    await sendWhatsAppMessage(
      from,
      `✅ *Akun Berhasil Dibuat!*\n══════════════════════════════\n👤 Nama   : *${displayName}*\n📱 Nomor  : +${from}\n══════════════════════════════\nSelamat datang di JustBot! 🎉`,
    );

    await onSuccess(displayName);
  } catch (err) {
    logger.error({ err, from }, '❌ [Auth] Registration failed');
    setPendingAction(from, null);
    await sendWhatsAppMessage(from, `❌ Terjadi kesalahan saat mendaftar. Coba lagi.`);
  }

  return true;
}

// ─── Ensure Authenticated ─────────────────────────────────────────────────────

/**
 * Pastikan user terautentikasi sebelum menjalankan perintah.
 * - Jika sudah punya token → langsung jalankan onAuth
 * - Jika belum → tampilkan register prompt
 *
 * @param from         Nomor WA user
 * @param senderName   Nama display dari WA
 * @param activeMode   Mode yang akan di-set jika perlu register dulu
 * @param onAuth       Callback yang dijalankan jika sudah terautentikasi
 */
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
