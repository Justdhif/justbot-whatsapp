<div align="center">

```
       ██╗██╗  ██╗███████╗████████╗██████╗  ██████╗ ████████╗
       ██║██║  ██║██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗╚══██╔══╝
       ██║██║  ██║███████╗   ██║   ██████╔╝██║   ██║   ██║
  ██   ██║██║  ██║╚════██║   ██║   ██╔══██╗██║   ██║   ██║
  ╚█████╔╝╚█████╔╝███████║   ██║   ██████╔╝╚██████╔╝   ██║
   ╚════╝  ╚════╝ ╚══════╝   ╚═╝   ╚═════╝  ╚═════╝    ╚═╝
```

# JustBot WhatsApp — Monorepo

**Platform asisten virtual berbasis WhatsApp yang cerdas, modular, dan siap produksi.**  
Ditenagai oleh Groq AI, dibangun di atas arsitektur monorepo tiga lapisan yang scalable.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://www.fastify.io/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-FF4500?style=for-the-badge&logo=openai&logoColor=white)](https://groq.com/)
[![WhatsApp API](https://img.shields.io/badge/WhatsApp_Cloud_API-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://developers.facebook.com/docs/whatsapp/cloud-api/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)

</div>

---

## 📋 Daftar Isi

- [Gambaran Umum](#-gambaran-umum)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Struktur Monorepo](#-struktur-monorepo)
- [Komponen Aplikasi](#-komponen-aplikasi)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Panduan Instalasi](#-panduan-instalasi)
- [Konfigurasi Lingkungan](#-konfigurasi-lingkungan)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Deployment](#-deployment)
- [Kontribusi](#-kontribusi)

---

## 🌐 Gambaran Umum

**JustBot WhatsApp** adalah platform bot percakapan berbasis WhatsApp yang dikembangkan dengan pendekatan arsitektur monorepo tiga lapisan (*three-tier monorepo architecture*). Platform ini mengintegrasikan kecerdasan buatan generatif dari **Groq AI (Llama-3.3 70B)** untuk menghasilkan respons yang alami, kontekstual, dan berkualitas tinggi.

Platform ini dirancang untuk memenuhi kebutuhan pengguna modern yang membutuhkan asisten pribadi cerdas langsung dari aplikasi WhatsApp — tanpa instalasi tambahan, tanpa kurva pembelajaran yang rumit.

### Nilai Utama Platform

| Dimensi | Keunggulan |
| :--- | :--- |
| **Kecepatan** | Respons AI sub-satu-detik melalui Groq LPU Inference Engine |
| **Skalabilitas** | Arsitektur monorepo dengan pemisahan domain yang jelas |
| **Keamanan** | JWT Sliding Session, Helmet, Rate Limiting, dan validasi input ketat |
| **Kemudahan Deploy** | Seluruh lapisan kompatibel dengan Netlify Functions (serverless) |
| **Biaya Operasional** | Dapat berjalan sepenuhnya di tier gratis Netlify + Neon Postgres |

---

## 🏛️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER / END USER                         │
│                    (via WhatsApp Mobile App)                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS Webhook
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    META WHATSAPP CLOUD API                      │
│                   (Message Relay & Delivery)                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ POST /webhook
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    apps/bot-service                             │
│         Fastify + TypeScript + Groq AI Engine                   │
│   [ Webhook Handler → Module Router → AI Response → WA API ]    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP REST
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        apps/api                                 │
│            NestJS + Drizzle ORM + Neon Postgres                 │
│     [ Auth / Users / Finance / Reminders REST Endpoints ]       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    apps/landing-page                            │
│              React + Vite + TailwindCSS + Framer Motion         │
│          [ Marketing Site — Publik, Terpisah dari Bot ]          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Struktur Monorepo

```
justbot-whatsapp/                     # Monorepo Root
├── package.json                      # Workspace scripts & npm workspaces config
├── .env.example                      # Contoh variabel lingkungan root
├── .gitignore
│
└── apps/                             # Direktori seluruh aplikasi
    ├── bot-service/                  # Layanan Inti Bot WhatsApp
    │   ├── src/
    │   │   ├── index.ts              # Entry point Fastify & Netlify export
    │   │   ├── config/               # Validasi env dengan Zod
    │   │   ├── core/                 # Domain logic & use-cases
    │   │   │   ├── domain/           # Entitas dan interface domain
    │   │   │   └── use-cases/        # Application use-cases
    │   │   ├── controllers/          # Webhook & route controllers
    │   │   ├── infrastructure/       # WhatsApp API & Groq AI client
    │   │   ├── types/                # TypeScript type definitions
    │   │   └── utils/                # Helper functions
    │   ├── functions/                # Netlify serverless function handler
    │   ├── netlify.toml
    │   └── package.json
    │
    ├── api/                          # Backend REST API
    │   ├── src/
    │   │   ├── main.ts               # NestJS bootstrap
    │   │   ├── lambda.ts             # Netlify Function adapter
    │   │   ├── app.module.ts         # Root module
    │   │   ├── config/               # App & JWT configuration
    │   │   ├── database/             # Drizzle ORM + Neon setup
    │   │   ├── common/               # Guards, filters, interceptors
    │   │   └── modules/              # Feature modules
    │   │       ├── auth/             # Authentication & JWT
    │   │       ├── users/            # User management
    │   │       ├── finance/          # Finance tracking
    │   │       └── reminders/        # Reminder management
    │   ├── scripts/                  # Database utility scripts
    │   ├── netlify.toml
    │   └── package.json
    │
    └── landing-page/                 # Halaman Marketing Publik
        ├── src/
        │   ├── App.tsx               # Root component & client-side routing
        │   ├── components/           # UI components (Navbar, Hero, dll.)
        │   ├── pages/                # Halaman statis (Privacy, Terms)
        │   ├── i18n.ts               # Konfigurasi internasionalisasi
        │   └── index.css             # Global styles
        ├── public/                   # Static assets
        ├── netlify.toml
        └── package.json
```

---

## 🧩 Komponen Aplikasi

### 1. `apps/bot-service` — Layanan Bot WhatsApp

Inti dari platform. Menangani seluruh siklus komunikasi dengan Meta WhatsApp Cloud API, mulai dari verifikasi webhook hingga pemrosesan pesan masuk, routing ke modul AI yang tepat, dan pengiriman respons kembali ke pengguna.

**Teknologi:** Fastify · TypeScript · Groq SDK · Zod · Pino · Serverless HTTP

**Modul AI yang Tersedia:**

| Modul | Perintah | Fungsi |
| :--- | :---: | :--- |
| 💻 Coding Assistant | `!coding` | Bantuan pemrograman & review kode |
| 💰 Finance Manager | `!finance` | Manajemen keuangan & aturan 50/30/20 |
| 🎥 Content Creator | `!creator` | Ide konten & script TikTok/Reels |
| 🌍 Polyglot Translator | `!translate` | Terjemahan multibahasa kontekstual |
| 📷 OCR Scanner | `!ocr` | Ekstraksi teks dari gambar |
| 📄 PDF & Document AI | `!pdf` | Ringkasan dokumen & analisis PDF |
| 📧 Executive Email | `!email` | Penulisan surat profesional |
| 📅 Agenda & Reminder | `!reminder` | Pengingat berbasis jadwal |
| 🛠️ Smart Utilities | `!util` | Kalkulator & utilitas umum |

> **Dokumentasi lengkap** → [`apps/bot-service/README.md`](./apps/bot-service/README.md)

---

### 2. `apps/api` — Backend REST API

Layer backend yang bertanggung jawab atas persistensi data, autentikasi pengguna, dan eksposi endpoint REST terstruktur. Menggunakan arsitektur modular NestJS dengan Drizzle ORM sebagai query builder yang type-safe di atas Neon Serverless Postgres.

**Teknologi:** NestJS · Drizzle ORM · Neon Postgres · JWT (Sliding Session) · Helmet · Throttler

**Modul yang Tersedia:** `Auth` · `Users` · `Finance` · `Reminders`

> **Dokumentasi lengkap** → [`apps/api/README.md`](./apps/api/README.md)

---

### 3. `apps/landing-page` — Halaman Publik

Antarmuka web publik yang berfungsi sebagai halaman pemasaran produk. Dibangun dengan React + Vite dan Framer Motion untuk animasi yang halus. Mendukung internasionalisasi (i18n) multi-bahasa.

**Teknologi:** React · Vite · TailwindCSS v4 · Framer Motion · i18next

> **Dokumentasi lengkap** → [`apps/landing-page/README.md`](./apps/landing-page/README.md)

---

## ⚙️ Persyaratan Sistem

| Dependensi | Versi Minimum | Keterangan |
| :--- | :---: | :--- |
| Node.js | `>= 20.x` | Diperlukan oleh semua workspace |
| npm | `>= 10.x` | Digunakan sebagai package manager |
| Git | `>= 2.x` | Untuk version control |

**Akun Layanan Eksternal yang Diperlukan:**

- [Meta Developer](https://developers.facebook.com/) — WhatsApp Cloud API credentials
- [Groq Console](https://console.groq.com/) — API Key untuk inferensi Llama-3.3 70B
- [Neon](https://neon.tech/) — Serverless PostgreSQL database
- [Netlify](https://www.netlify.com/) — Platform deployment (opsional)

---

## 🚀 Panduan Instalasi

### 1. Clone Repositori

```bash
git clone https://github.com/Justdhif/justbot-whatsapp.git
cd justbot-whatsapp
```

### 2. Install Semua Dependensi

Perintah berikut akan menginstal dependensi untuk seluruh workspace secara sekaligus:

```bash
npm install
```

---

## 🔐 Konfigurasi Lingkungan

Setiap aplikasi memiliki file `.env` terpisah. Salin file contoh berikut dan isi dengan nilai yang sesuai:

```bash
# Bot Service
cp apps/bot-service/.env.example apps/bot-service/.env

# API Backend
cp apps/api/.env.example apps/api/.env
```

Lihat dokumentasi masing-masing aplikasi untuk detail setiap variabel lingkungan.

---

## ▶️ Menjalankan Aplikasi

Semua perintah dijalankan dari **direktori root** monorepo.

### Development Mode

```bash
# Menjalankan Bot Service
npm run dev:bot

# Menjalankan API Backend
npm run dev:api

# Menjalankan Landing Page (dari direktori apps/landing-page)
cd apps/landing-page && npm run dev
```

### Build Production

```bash
npm run build:bot    # Build Bot Service
npm run build:api    # Build API Backend
```

### Database Management

```bash
npm run db:generate  # Generate migrasi Drizzle
npm run db:push      # Push schema ke database
npm run db:studio    # Buka Drizzle Studio (GUI)
npm run db:reset     # Reset & re-push seluruh schema
```

---

## ☁️ Deployment

Platform ini dirancang untuk di-deploy sebagai **Netlify Functions** (serverless). Setiap aplikasi memiliki konfigurasi `netlify.toml` masing-masing.

### Langkah Umum

1. Push repositori ke GitHub.
2. Buka [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Pilih repositori dan konfigurasikan sesuai dengan panduan di README masing-masing aplikasi.
4. Tambahkan Environment Variables yang diperlukan di dashboard Netlify.
5. Deploy.

> Setiap aplikasi (`bot-service`, `api`, `landing-page`) dapat di-deploy sebagai **site Netlify terpisah** untuk fleksibilitas dan isolasi yang optimal.

---

## 🤝 Kontribusi

Kontribusi dalam bentuk apapun sangat disambut baik. Untuk perubahan besar, harap buka *issue* terlebih dahulu untuk mendiskusikan perubahan yang ingin dilakukan.

1. Fork repositori ini.
2. Buat branch fitur baru: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambahkan fitur X'`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request.

---

<div align="center">

Dikembangkan dengan dedikasi oleh **[Nadhif Ararya (Justdhif)](https://github.com/Justdhif)**

*Build for the future, code with purpose.*

</div>
