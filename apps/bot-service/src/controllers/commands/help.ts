import { sendWhatsAppInteractiveList, sendWhatsAppButtons, sendWhatsAppImage } from '../../infrastructure/gateways/whatsapp.gateway.js';
import { MODULE_DETAILS } from '../../core/use-cases/process-message.use-case.js';
import { getBotBaseUrl } from '../../config/env.js';

export async function handleHelpCommand(
  from: string,
  userText: string
): Promise<boolean> {
  const lower = userText.trim().toLowerCase();

  if (lower === ".help") {
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
      { id: "select:help:sticker", title: "🖼️ Sticker Generator", description: "Membuat stiker biasa & stiker teks Brat" },
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

  if (lower.startsWith("select:help:")) {
    const helpMode = lower.replace("select:help:", "");
    const detail = MODULE_DETAILS[helpMode];
    if (detail) {
      if (helpMode === "finance") {
        const baseUrl = getBotBaseUrl();
        const bannerUrl = baseUrl && baseUrl.startsWith("http") && !baseUrl.includes("localhost") && !baseUrl.includes("127.0.0.1")
          ? `${baseUrl}/assets/finance-banner.jpg`
          : "https://tmpfiles.org/dl/w1wyRQ9wYwQu/finance-banner.jpg";
        const bannerCaption = `💰 *PANDUAN: ${detail.name.toUpperCase()}*`;
        await sendWhatsAppImage(from, bannerUrl, bannerCaption);
      }

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

  return false;
}
