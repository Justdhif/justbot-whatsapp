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
Ditenagai oleh Groq AI, dibangun di atas arsitektur monorepo empat lapisan yang scalable.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
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

**JustBot WhatsApp** adalah platform bot percakapan berbasis WhatsApp yang dikembangkan dengan pendekatan arsitektur monorepo empat lapisan (*four-tier monorepo architecture*). Platform ini mengintegrasikan kecerdasan buatan generatif dari **Groq AI (Llama-3.3 70B)** untuk menghasilkan respons yang alami, kontekstual, dan berkualitas tinggi.

Platform ini dirancang untuk memenuhi kebutuhan pengguna modern yang membutuhkan asisten pribadi cerdas langsung dari aplikasi WhatsApp — tanpa instalasi tambahan, tanpa kurva pembelajaran yang rumit, serta terintegrasi dengan panel kontrol kontrol web personal.

### Nilai Utama Platform

| Dimensi | Keunggulan |
| :--- | :--- |
| **Kecepatan** | Respons AI sub-satu-detik melalui Groq LPU Inference Engine |
| **Skalabilitas** | Arsitektur monorepo dengan pemisahan domain yang jelas |
| **Keamanan** | JWT Sliding Session, Helmet, Rate Limiting, dan validasi input ketat |
| **Kemudahan Deploy** | Seluruh lapisan kompatibel dengan Netlify Functions & Static (serverless) |
| **Biaya Operasional** | Dapat berjalan sepenuhnya di tier gratis Netlify + Neon Postgres |

---

## 🏛️ Arsitektur Sistem

```
┌─────────────────────────────────────────┐     ┌─────────────────────────────────────────┐
│             USER / END USER             │     │              BOT DEVELOPER              │
│        (via WhatsApp Mobile App)        │     │         (via Web Control Portal)        │
└───────────────────┬─────────────────────┘     └────────────────────┬────────────────────┘
                    │ HTTPS Webhook                                  │ HTTPS
                    ▼                                                ▼
┌─────────────────────────────────────────┐     ┌─────────────────────────────────────────┐
│        META WHATSAPP CLOUD API          │     │          apps/web/dashboard             │
│       (Message Relay & Delivery)        │     │  Next.js + TailwindCSS + Shadcn/ui      │
└───────────────────┬─────────────────────┘     └────────────────────┬────────────────────┘
                    │ POST /webhook                                  │
                    ▼                                                │ HTTP REST
┌─────────────────────────────────────────┐                          │
│            apps/bot-service             │                          │
│  Fastify + TypeScript + Groq AI Engine  ├──────────────┐           │
└─────────────────────────────────────────┘              │           │
                                                         │ HTTP REST │
                                                         ▼           ▼
                                            ┌─────────────────────────────────────────────┐
                                            │                 apps/api                    │
                                            │   NestJS + Drizzle ORM + Neon Postgres      │
                                            └─────────────────────────────────────────────┘
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
    │   │   ├── controllers/          # Webhook & route controllers
    │   │   └── infrastructure/       # WhatsApp API & Groq AI client
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
    │   │   └── modules/              # Feature modules (auth, finance, reminders)
    │   ├── scripts/                  # Database utility scripts
    │   ├── netlify.toml
    │   └── package.json
    │
    ├── web/                          # Aplikasi Web Frontend
    │   ├── dashboard/                # Panel Kontrol Admin (Hanya Login)
    │   │   ├── src/
    │   │   │   ├── app/              # Next.js App Router (dashboard, login, dll.)
    │   │   │   ├── components/       # Komponen UI
    │   │   │   └── lib/              # Client API fetch adapter
    │   │   └── package.json
    │   │
    │   └── manager/                  # Portal Registrasi Manager (Auto-Login & Token Cycling)
    │       ├── src/
    │       │   ├── app/              # Next.js App Router (dashboard, register, dll.)
    │       │   ├── components/       # Komponen UI (sidebar tanpa pengaturan bot)
    │       │   └── lib/              # Client API fetch dengan proactive refresh
    │       └── package.json
    │
    │
    └── landing-page/                 # Halaman Marketing Publik
        ├── src/
        │   ├── components/           # Komponen pemasaran interaktif
        │   ├── locales/              # Internasionalisasi (i18n) localization files
        │   └── main.tsx              # React bootstrap
        ├── vite.config.ts
        └── package.json
```

---

## 📦 Komponen Aplikasi

### 1. `apps/bot-service` — Layanan Inti Bot WhatsApp

Layanan utama yang menerima webhook dari WhatsApp Cloud API, menganalisis intensi pesan pengguna, mengarahkan ke sub-modul yang sesuai, dan membalas pesan secara instan.

**Teknologi:** Fastify · TypeScript · Groq AI Engine (Llama-3.3 70B) · Meta Cloud API SDK · Zod

**Modul yang Tersedia:** `Coding Assistant` · `Finance Consultant` · `Content Creator` · `PDF & Document AI` · `OCR Scanner` · `Polyglot Translator` · `Agenda & Reminder` · `Executive Email` · `Sticker Generator` · `Smart Utilities`

> **Dokumentasi lengkap** → [`apps/bot-service/README.md`](./apps/bot-service/README.md)

---

### 2. `apps/api` — Backend REST API

Layer backend yang bertanggung jawab atas persistensi data, autentikasi pengguna, dan eksposi endpoint REST terstruktur. Menggunakan arsitektur modular NestJS dengan Drizzle ORM sebagai query builder yang type-safe di atas Neon Serverless Postgres.

**Teknologi:** NestJS · Drizzle ORM · Neon Postgres · JWT (Sliding Session) · Helmet · Throttler

**Modul yang Tersedia:** `Auth` · `Users` · `Finance` · `Reminders` · `Analytics`

> **Dokumentasi lengkap** → [`apps/api/README.md`](./apps/api/README.md)

---

### 3. `apps/web/dashboard` — Panel Kontrol Admin Portal

Panel kontrol administratif khusus bagi **Admin/Super Admin** untuk memantau status bot WhatsApp secara real-time, mengonfigurasi pengaturan behavior bot secara visual, dan memantau status sistem. Menggunakan sistem masuk aman murni tanpa pendaftaran publik.

**Teknologi:** Next.js (App Router) · React 19 · TailwindCSS v4 · Shadcn/ui · Recharts

> **Dokumentasi lengkap** → [`apps/web/dashboard/README.md`](./apps/web/dashboard/README.md)

---

### 4. `apps/web/manager` — Portal Registrasi & Panel Keuangan Manager

Portal pendaftaran mandiri khusus bagi **Manager** untuk mencatat arus kas laporan keuangan personal dan menyusun timeline notifikasi pengingat via bot WhatsApp. Didesain ramah tanpa portal masuk terpisah (pendaftaran langsung masuk) serta dilengkapi fungsionalitas token sliding session jangka panjang (Instagram/TikTok-style).

**Teknologi:** Next.js (App Router) · React 19 · TailwindCSS v4 · Shadcn/ui · Recharts

> **Dokumentasi lengkap** → [`apps/web/manager/README.md`](./apps/web/manager/README.md)

---

### 5. `apps/landing-page` — Halaman Publik

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

1. **Clone Repositori:**
   ```bash
   git clone https://github.com/Justdhif/justbot-whatsapp.git
   cd justbot-whatsapp
   ```

2. **Instalasi Dependensi Monorepo:**
   Monorepo ini menggunakan npm workspaces. Cukup jalankan perintah berikut di root untuk menginstal semua dependensi di seluruh sub-aplikasi:
   ```bash
   npm install
   ```

---

## 📄 Konfigurasi Lingkungan

Setiap aplikasi memiliki file `.env` terpisah. Salin file contoh berikut dan isi dengan nilai yang sesuai:

```bash
# Bot Service
cp apps/bot-service/.env.example apps/bot-service/.env

# API Backend
cp apps/api/.env.example apps/api/.env

# Dashboard Admin
cp apps/web/dashboard/.env.example apps/web/dashboard/.env.local

# Portal Manager
cp apps/web/manager/.env.example apps/web/manager/.env.local
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

# Menjalankan Dashboard Admin
npm run dev:dashboard

# Menjalankan Portal Manager
npm run dev:manager

# Menjalankan Landing Page
cd apps/landing-page && npm run dev
```

### Build Production

```bash
npm run build:bot        # Build Bot Service
npm run build:api        # Build API Backend
npm run build:dashboard  # Build Dashboard Admin
npm run build:manager    # Build Portal Manager
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

Platform ini dirancang untuk di-deploy sebagai **Netlify Functions** (serverless) dan **Static Sites**. Setiap aplikasi memiliki konfigurasi `netlify.toml` masing-masing.

### Langkah Umum

1. Push repositori ke GitHub.
2. Buka [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Pilih repositori dan konfigurasikan sesuai dengan panduan di README masing-masing aplikasi.
4. Tambahkan Environment Variables yang diperlukan di dashboard Netlify.
5. Deploy.

> Setiap aplikasi (`bot-service`, `api`, `web/dashboard`, `web/manager`, `landing-page`) dapat di-deploy sebagai **site Netlify terpisah** untuk fleksibilitas dan isolasi yang optimal.

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
