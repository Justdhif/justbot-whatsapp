# 🤖 Bot Service — JustBot WhatsApp

**Layanan inti yang mengelola seluruh siklus komunikasi bot WhatsApp.**  
Menerima webhook dari Meta, memproses pesan pengguna, merutekan ke modul AI yang tepat, dan mengirimkan respons kembali melalui WhatsApp Cloud API.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-000000?style=flat-square&logo=fastify&logoColor=white)](https://www.fastify.io/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-FF4500?style=flat-square&logo=openai&logoColor=white)](https://groq.com/)
[![Netlify](https://img.shields.io/badge/Netlify_Functions-00C7B7?style=flat-square&logo=netlify&logoColor=white)](https://docs.netlify.com/functions/overview/)

---

## 📋 Daftar Isi

- [Gambaran Umum](#-gambaran-umum)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Arsitektur Internal](#-arsitektur-internal)
- [Struktur Direktori](#-struktur-direktori)
- [Modul AI](#-modul-ai)
- [Fitur Lanjutan](#-fitur-lanjutan)
- [Konfigurasi Lingkungan](#-konfigurasi-lingkungan)
- [Menjalankan Secara Lokal](#-menjalankan-secara-lokal)
- [Build & Deployment](#-build--deployment)

---

## 🌐 Gambaran Umum

`bot-service` adalah jantung dari platform JustBot. Aplikasi ini bertindak sebagai **webhook receiver** yang mendengarkan pesan masuk dari Meta WhatsApp Cloud API, kemudian memproses setiap pesan melalui pipeline berikut:

```
Pesan Masuk (WhatsApp)
       │
       ▼
[Fastify HTTP Server]
       │
       ▼
[Webhook Verifier & Parser]
       │
       ▼
[Message Router / Controller]
       │
  ┌────┴────┐
  │         │
  ▼         ▼
[Core       [AI Module
 Use-Cases]  Handler]
  │         │
  └────┬────┘
       │
       ▼
[Groq AI Engine (Llama-3.3 70B)]
       │
       ▼
[WhatsApp Cloud API Response]
       │
       ▼
Pesan Terkirim ke Pengguna
```

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Versi | Fungsi |
| :--- | :---: | :--- |
| **Fastify** | ^4.28 | HTTP server berkecepatan tinggi |
| **TypeScript** | ^5.5 | Type safety & developer experience |
| **Groq SDK** | ^0.9 | Client untuk Groq AI inference API |
| **Zod** | ^3.23 | Runtime validation & env parsing |
| **Pino** | ^9.5 | Structured logging berkinerja tinggi |
| **Axios** | ^1.7 | HTTP client untuk WhatsApp Cloud API |
| **Sharp** | ^0.35 | Pemrosesan dan transformasi gambar |
| **Serverless HTTP** | ^3.2 | Adapter Fastify ke Netlify Functions |

---

## 🏗️ Arsitektur Internal

Layanan ini menerapkan prinsip **Clean Architecture** dengan pemisahan domain yang jelas:

```
src/
├── index.ts              # Bootstrap: Fastify server + Netlify export
│
├── config/               # Konfigurasi & Validasi Lingkungan
│   └── env.ts            # Zod schema untuk semua variabel .env
│
├── core/                 # Domain Layer (Business Logic)
│   ├── domain/           # Entitas, interface, dan kontrak domain
│   └── use-cases/        # Application use-cases (orchestration)
│
├── controllers/          # Interface Adapter Layer
│   └── webhook.controller.ts   # Menerima & mendispatch pesan WhatsApp
│
├── infrastructure/       # Framework & Driver Layer
│   ├── groq.client.ts    # Client untuk Groq AI API
│   └── whatsapp.client.ts # Client untuk Meta WhatsApp Cloud API
│
├── assets/               # Aset statis (gambar banner, dll.)
│
├── types/                # TypeScript type definitions global
│
└── utils/                # Fungsi-fungsi helper
    ├── schedule.ts        # Logic jam operasional bot
    └── media.ts           # Helper pemrosesan media
```

---

## 🧩 Modul AI

Bot Service dilengkapi dengan **9 modul AI** yang dapat diakses oleh pengguna melalui perintah khusus di WhatsApp:

| # | Modul | Perintah Aktivasi | Deskripsi |
| :- | :--- | :---: | :--- |
| 1 | 💻 **Coding Assistant** | `!coding` | Asisten pemrograman multi-bahasa, code review, dan debugging |
| 2 | 💰 **Finance Manager** | `!finance` | Perencanaan keuangan personal dengan aturan 50/30/20 |
| 3 | 🎥 **Content Creator** | `!creator` | Generator ide konten & script untuk TikTok/Reels/YouTube |
| 4 | 🌍 **Polyglot Translator** | `!translate` | Terjemahan kontekstual multibahasa yang alami |
| 5 | 📷 **OCR Scanner** | `!ocr` | Ekstraksi dan digitalisasi teks dari gambar |
| 6 | 📄 **PDF & Document AI** | `!pdf` | Ringkasan dan analisis dokumen panjang |
| 7 | 📧 **Executive Email** | `!email` | Penulisan surat dan email formal berkualitas profesional |
| 8 | 📅 **Agenda & Reminder** | `!reminder` | Manajemen jadwal dan pengingat harian |
| 9 | 🛠️ **Smart Utilities** | `!util` | Kalkulator, konversi unit, dan utilitas umum |

---

## ✨ Fitur Lanjutan

### Stateful Interactive Mode
Pengguna dapat masuk ke mode percakapan interaktif dengan menekan tombol `🚀 Start Mode` dan keluar menggunakan tombol `🔴 Exit Mode`. Sistem melacak status sesi setiap pengguna menggunakan **State Machine** in-memory.

### Smart Operational Hours (Quota Saver)
Bot secara otomatis menonaktifkan diri di luar jam operasional yang dikonfigurasi. Fitur ini menjaga konsumsi kuota Meta WhatsApp Cloud API (1.000 percakapan/bulan gratis) tetap efisien.

### Interactive UI Card
Setiap respons bot dapat dilengkapi dengan elemen UI WhatsApp yang kaya:
- **Quick Reply Buttons** — Tombol aksi cepat untuk navigasi menu
- **Dropdown List** — Pilihan interaktif dalam format list
- **Header Banner** — Gambar banner visual resolusi tinggi

---

## 🔐 Konfigurasi Lingkungan

Salin file contoh dan isi dengan nilai yang sesuai:

```bash
cp .env.example .env
```

| Variabel | Wajib | Deskripsi |
| :--- | :---: | :--- |
| `PORT` | ✅ | Port server lokal (default: `3000`) |
| `HOST` | ✅ | Host server (default: `0.0.0.0`) |
| `GROQ_API_KEY` | ✅ | API Key dari [console.groq.com](https://console.groq.com) |
| `WA_VERIFY_TOKEN` | ✅ | Token verifikasi webhook WhatsApp (bebas diisi) |
| `WA_PHONE_NUMBER_ID` | ✅ | Phone Number ID dari Meta Developer Console |
| `WA_CLOUD_API_ACCESS_TOKEN` | ✅ | Access token permanen dari Meta |
| `BOT_ENABLE_SCHEDULE` | ⬜ | Aktifkan jam operasional (`true`/`false`) |
| `BOT_OPERATIONAL_START` | ⬜ | Jam mulai operasional, format `HH:MM` WIB |
| `BOT_OPERATIONAL_END` | ⬜ | Jam selesai operasional, format `HH:MM` WIB |
| `BOT_OPERATIONAL_DAYS` | ⬜ | Hari aktif (1=Sen, 7=Min), pisahkan dengan koma |

**Contoh konfigurasi `.env`:**

```env
PORT=3000
HOST=0.0.0.0

GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
WA_VERIFY_TOKEN=my_secret_verify_token
WA_PHONE_NUMBER_ID=1234567890123456
WA_CLOUD_API_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

BOT_ENABLE_SCHEDULE=true
BOT_OPERATIONAL_START=08:00
BOT_OPERATIONAL_END=22:00
BOT_OPERATIONAL_DAYS=1,2,3,4,7
```

---

## ▶️ Menjalankan Secara Lokal

### Dari direktori `apps/bot-service`

```bash
# Install dependensi
npm install

# Jalankan development server dengan hot-reload
npm run dev
```

### Dari direktori root monorepo

```bash
npm run dev:bot
```

Server akan berjalan di `http://localhost:3000`.

> **Tip:** Gunakan [ngrok](https://ngrok.com/) atau [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) untuk mengekspos server lokal sebagai HTTPS endpoint yang dapat digunakan sebagai webhook Meta WhatsApp.

```bash
# Contoh menggunakan ngrok
ngrok http 3000
```

---

## 📦 Build & Deployment

### Build Production

```bash
npm run build
```

Output akan tersedia di direktori `dist/`.

### Deployment ke Netlify

`bot-service` dikonfigurasi untuk berjalan sebagai **Netlify Function** melalui file `netlify.toml`.

**Langkah deployment:**

1. Push repositori ke GitHub.
2. Buat site baru di [app.netlify.com](https://app.netlify.com).
3. Atur **Base directory** ke `apps/bot-service`.
4. Tambahkan seluruh Environment Variables dari file `.env` ke dashboard Netlify.
5. Deploy.

Setelah deploy berhasil, gunakan URL Netlify Function sebagai **Callback URL** di Meta Developer Console:

```
https://<your-site>.netlify.app/.netlify/functions/api/webhook
```

---

## 🔗 Referensi

- [Meta WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Groq API Documentation](https://console.groq.com/docs/openai)
- [Fastify Documentation](https://fastify.dev/)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)

---

<div align="center">

Bagian dari [JustBot WhatsApp Monorepo](../../README.md)

Dikembangkan oleh **[Nadhif Ararya (Justdhif)](https://github.com/Justdhif)**

</div>
