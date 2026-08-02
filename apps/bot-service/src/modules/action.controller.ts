import { sendWhatsAppMessage, sendWhatsAppImage, sendWhatsAppButtons, sendWhatsAppInteractiveList, sendWhatsAppSticker } from '../services/whatsapp.service.js';
import { generateBratSticker, generateBratVideoSticker } from '../services/brat.service.js';
import { generateStickerFromWhatsAppMedia } from '../services/whatsapp.service.js';
import { processCuanBuddyCheck, getFinanceIntroMessage } from './finance/finance.handler.js';
import { getHelpMenu } from './utilities/utilities.handler.js';
import { MODULE_DETAILS } from './router.js';
import { setUserActiveMode, clearUserLastImage } from '../utils/session.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export async function handleWebhookActionOrMessage(
  from: string,
  userText: string,
  senderName: string,
  session: any
): Promise<boolean> {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();

  // 1. CuanBuddy Direct Command Preview Page
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

  // 2. Action: Exit Active Mode Session
  if (lower === "action:exit" || lower === ".exit") {
    setUserActiveMode(from, null);
    const exitText = `🔴 *MODE DIMATIKAN*\n══════════════════════════════\nAnda telah keluar dari mode khusus. Silakan obrolkan apa saja atau ketik \`.menu\` untuk memilih modul baru.`;
    const exitButtons = [{ id: ".menu", title: "📋 Buka Menu" }];
    await sendWhatsAppButtons(from, exitText, exitButtons, "🤖 MODE OFF");
    return true;
  }

  // 3. Action: Start CuanBuddy Mode
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

  // 4. Action: Check Realtime CuanBuddy Connection Status
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

  // 5. Action: List selection details preview for CuanBuddy
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

  // 6. Action: Show Menu Info Listing Page
  if (lower === ".menu" || lower === "!menu" || lower === "menu") {
    const menuText = getHelpMenu(senderName);
    const botAvatarBanner = "https://picsum.photos/800/600";
    await sendWhatsAppImage(from, botAvatarBanner, menuText);
    return true;
  }

  // 7. Action: Show help documentation list
  if (lower === ".help" || lower === "/help" || lower === "help") {
    const helpBody = `✨ *PANDUAN & BANTUAN LAYANAN JUSTBOT* ✨
════════════════════════════════════════

Silakan klik tombol *Pilih Modul* di bawah untuk melihat rincian penjelasan kemampuan, cara kerja, dan daftar perintah operasional dari masing-masing modul/skill JustBot.`;

    const listRows = [
      { id: "select:help:coding", title: "💻 Coding Assistant", description: "Bantuan penulisan & debug kode pemrograman" },
      { id: "select:help:finance", title: "💰 Finance Consultant", description: "Konsultasi keuangan & manajemen budget" },
      { id: "select:help:creator", title: "🎥 Content Creator", description: "Ide & naskah konten TikTok/Reels" },
      { id: "select:help:pdf", title: "📄 PDF & Document AI", description: "Rangkum & bedah dokumen PDF" },
      { id: "select:help:ocr", title: "📷 OCR Scanner", description: "Mengekstrak tulisan dari gambar" },
      { id: "select:help:translate", title: "🌍 Polyglot Translator", description: "Terjemahan bahasa kontekstual alami" },
      { id: "select:help:reminder", title: "📅 Agenda & Reminder", description: "Mengatur tugas & to-do list harian" },
      { id: "select:help:email", title: "📧 Executive Email", description: "Penyusunan draf email profesional" },
      { id: "select:help:util", title: "🛠️ Smart Utilities", description: "Kalkulator instan & konversi satuan" }
    ];

    await sendWhatsAppInteractiveList(
      from,
      helpBody,
      "Pilih Modul",
      [{ title: "DAFTAR MODUL", rows: listRows }],
      "📖 PANDUAN MODUL"
    );
    return true;
  }

  // 8. Action: Select help documentation details per module list
  if (lower.startsWith("select:help:")) {
    const helpMode = lower.replace("select:help:", "");
    const detail = MODULE_DETAILS[helpMode];
    if (detail) {
      const docText = `╭────────────────────────────
│  ${detail.icon} *PANDUAN: ${detail.name.toUpperCase()}*
╰────────────────────────────
${detail.desc}

💡 *Kemampuan Utama*:
${detail.capabilities.map((c) => ` ├─ ${c}`).join("\n")}
════════════════════════════════════════
📌 _Ketik pertanyaan atau kirim dokumen yang berkaitan langsung dengan fitur di atas untuk mencobanya secara otomatis!_`;

      const menuButtons = [{ id: ".help", title: "📖 Panduan Lain" }, { id: ".menu", title: "📋 Menu Utama" }];
      await sendWhatsAppButtons(from, docText, menuButtons, `HELP: ${detail.name}`);
      return true;
    }
  }

  // 9. Sticker command: Brat Animated Video (bratv / bratvid)
  const bratVideoCommandMatch = trimmed.match(/^(?:\.|\/)?brat(?:\s+(?:v|vid|video|gif)|v|vid|video|gif)(?:\s*[:\s]\s*(.*))?$/i);
  if (bratVideoCommandMatch) {
    const bratText = (bratVideoCommandMatch[1] || '').trim();
    if (!bratText) {
      await sendWhatsAppMessage(from, 'Ketik `.bratv teks kamu` untuk membuat sticker Brat animasi.');
      return true;
    }
    await sendWhatsAppMessage(from, '⏳ Sedang membuat sticker Brat animasi...');
    const stickerBuffer = await generateBratVideoSticker(bratText);
    const stickerSent = await sendWhatsAppSticker(from, stickerBuffer);
    if (!stickerSent) {
      await sendWhatsAppMessage(from, 'Gagal mengirim sticker Brat animasi. Coba lagi beberapa saat.');
    }
    return true;
  }

  // 10. Sticker command: Convert Image to WebP Sticker (sticker / s)
  const stickerCommandMatch = trimmed.match(/^(?:\.|\/)?(?:sticker|s)\b(?:\s+(.*))?$/i);
  if (stickerCommandMatch) {
    const lastImageMediaId = session.lastImageMediaId;
    const commandText = (stickerCommandMatch[1] || "").trim();
    if (commandText) {
      await sendWhatsAppMessage(from, "Kirim gambar lalu caption `.sticker` atau reply gambar dengan `.sticker` untuk membuat sticker.");
      return true;
    }
    if (!lastImageMediaId) {
      await sendWhatsAppMessage(from, "Saya belum menemukan gambar terakhir untuk diubah menjadi sticker. Kirim foto dulu lalu reply `.sticker`.");
      return true;
    }
    await sendWhatsAppMessage(from, "⏳ Sedang membuat sticker dari gambar terakhir...");
    const stickerBuffer = await generateStickerFromWhatsAppMedia(lastImageMediaId);
    if (!stickerBuffer) {
      await sendWhatsAppMessage(from, "Gagal membuat sticker dari gambar terakhir. Coba kirim ulang fotonya.");
      return true;
    }
    const stickerSent = await sendWhatsAppSticker(from, stickerBuffer);
    if (!stickerSent) {
      await sendWhatsAppMessage(from, "Gagal mengirim sticker. Coba lagi beberapa saat.");
    }
    clearUserLastImage(from);
    return true;
  }

  // 11. Sticker command: Brat static text (brat)
  const bratCommandMatch = trimmed.match(/^(?:\.|\/)?brat(?:\s*[:\s]\s*(.*))?$/i);
  if (bratCommandMatch) {
    const bratText = (bratCommandMatch[1] || '').trim();
    if (!bratText) {
      await sendWhatsAppMessage(from, 'Ketik `.brat teks kamu` untuk membuat sticker Brat.');
      return true;
    }
    await sendWhatsAppMessage(from, '⏳ Sedang membuat sticker Brat...');
    const stickerBuffer = await generateBratSticker(bratText);
    const stickerSent = await sendWhatsAppSticker(from, stickerBuffer);
    if (!stickerSent) {
      await sendWhatsAppMessage(from, 'Gagal mengirim sticker Brat. Coba lagi beberapa saat.');
    }
    return true;
  }

  return false;
}
