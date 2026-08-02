import { sendWhatsAppImage, sendWhatsAppButtons, sendWhatsAppMessage } from '../../infrastructure/gateways/whatsapp.gateway.js';
import { processCuanBuddyCheck } from '../../core/use-cases/finance.use-case.js';
import { setUserActiveMode } from '../../infrastructure/store/session.store.js';
import { MODULE_DETAILS } from '../../core/use-cases/process-message.use-case.js';

export async function handleCuanBuddyCommand(
  from: string,
  userText: string,
  senderName: string
): Promise<boolean> {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();

  // Direct OTP / OTP Input Check inside mode
  if (/^\d{6}$/.test(trimmed)) {
    return false; // Handled directly in process-message use-case
  }

  // 1. Direct Command Preview Page
  const directCmdMode = lower.startsWith(".") ? lower.replace(".", "") : "";
  if (directCmdMode === "cuanbuddy" && MODULE_DETAILS[directCmdMode]) {
    const detail = MODULE_DETAILS[directCmdMode];
    const bannerUrl = "https://picsum.photos/800/600";
    const bannerCaption = `${detail.icon} *PREVIEW: ${detail.name.toUpperCase()}*`;
    await sendWhatsAppImage(from, bannerUrl, bannerCaption);

    const previewText = `╭────────────────────────────
│  ${detail.icon} *INFO MODUL: ${detail.name.toUpperCase()}*
╰────────────────────────────
${detail.desc}

✨ *Kemampuan Utama*:
${detail.capabilities.map((c) => ` ├─ ${c}`).join("\n")}
══════════════════════════════════════
Tekan tombol di bawah untuk memulai modul ini:`;

    const startButtons = [
      { id: `action:start:${directCmdMode}`, title: "🚀 Start Mode" },
      { id: ".menu", title: "📋 Kembali Ke Menu" },
    ];
    await sendWhatsAppButtons(from, previewText, startButtons, `${detail.icon} PREVIEW: ${detail.name}`);
    return true;
  }

  // 2. Start CuanBuddy Mode Connection Action
  if (lower.startsWith("action:start:")) {
    const selectedMode = lower.replace("action:start:", "");
    if (selectedMode === "cuanbuddy") {
      const loadingMsg = `⏳ _Mohon tunggu sebentar, sedang memverifikasi koneksi WhatsApp Anda dengan akun CuanBuddy..._`;
      await sendWhatsAppMessage(from, loadingMsg);

      const verificationResult = await processCuanBuddyCheck(from, senderName);
      if (verificationResult.includes("WELCOME BACK")) {
        setUserActiveMode(from, "finance");
        const linkedSuccessText = `🟢 *INTEGRASI CUANBUDDY AKTIF!* 🟢
══════════════════════════════════════
Status: Akun Anda terverifikasi dan tersambung!

Semua pesan berupa rincian transaksi pengeluaran/pemasukan yang Anda ketik di mode ini akan otomatis tercatat ke dashboard CuanBuddy Anda secara realtime.

👇 *Jika ingin keluar dari mode ini, klik tombol di bawah:*`;

        const linkedButtons = [
          { id: "action:exit", title: "🔴 Exit Mode" },
          { id: ".menu", title: "📋 Buka Menu" },
        ];
        await sendWhatsAppButtons(from, linkedSuccessText, linkedButtons, "🟢 CUANBUDDY ACTIVE");
      } else {
        const menuButtons = [{ id: ".menu", title: "📋 Buka Menu" }];
        await sendWhatsAppButtons(from, verificationResult, menuButtons, "❌ KONEKSI GAGAL");
      }
      return true;
    }
  }

  // 3. Check Connection Status Action
  if (lower === "action:cuanbuddy:check") {
    const loadingMsg = `⏳ _Mohon tunggu sebentar, sedang memproses dan mengambil data Anda dari CuanBuddy App..._`;
    await sendWhatsAppMessage(from, loadingMsg);

    const resultMsg = await processCuanBuddyCheck(from, senderName);
    const menuButtons = [
      { id: "action:exit", title: "🔴 Exit Mode" },
      { id: ".menu", title: "📋 Buka Menu" },
    ];
    await sendWhatsAppButtons(from, resultMsg, menuButtons, "💳 CUANBUDDY STATUS");
    return true;
  }

  // 4. Module Selection Handler
  if (lower.startsWith("select:module:")) {
    const selectedMode = lower.replace("select:module:", "");
    if (selectedMode === "cuanbuddy") {
      const detail = MODULE_DETAILS[selectedMode];
      if (detail) {
        const bannerUrl = "https://picsum.photos/800/600";
        const bannerCaption = `${detail.icon} *PREVIEW: ${detail.name.toUpperCase()}*`;
        await sendWhatsAppImage(from, bannerUrl, bannerCaption);

        const previewText = `╭────────────────────────────
│  ${detail.icon} *INFO MODUL: ${detail.name.toUpperCase()}*
╰────────────────────────────
${detail.desc}

✨ *Kemampuan Utama*:
${detail.capabilities.map((c) => ` ├─ ${c}`).join("\n")}
══════════════════════════════════════
Tekan tombol di bawah untuk memulai modul ini:`;

        const startButtons = [
          { id: `action:start:${selectedMode}`, title: "🚀 Start Mode" },
          { id: ".menu", title: "📋 Kembali Ke Menu" },
        ];
        await sendWhatsAppButtons(from, previewText, startButtons, `${detail.icon} PREVIEW: ${detail.name}`);
        return true;
      }
    }
  }

  return false;
}
