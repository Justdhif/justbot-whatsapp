# 📊 Admin Portal — JustBot Control Console

**Portal web administratif khusus bagi Admin dan Super Admin untuk memantau status bot WhatsApp serta sistem.**  
Dibangun dengan Next.js (App Router), TailwindCSS v4, Shadcn/ui resmi, dan Recharts untuk menyajikan visualisasi data yang responsif dan premium.

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-000000?style=flat-square&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Recharts](https://img.shields.io/badge/Recharts-22B573?style=flat-square&logo=recharts&logoColor=white)](https://recharts.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)](https://www.netlify.com/)

---

## 📋 Daftar Isi

- [Gambaran Umum](#-gambaran-umum)
- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Arsitektur Autentikasi & Token Rotation](#-arsitektur-autentikasi--token-rotation)
- [Struktur Direktori](#-struktur-direktori)
- [Konfigurasi Lingkungan](#-konfigurasi-lingkungan)
- [Menjalankan Secara Lokal](#-menjalankan-secara-lokal)
- [Build & Deployment](#-build--deployment)

---

## 🌐 Gambaran Umum

`apps/web/dashboard` adalah panel kontrol utama khusus untuk peran administratif/admin:
- Memantau aktivitas interaksi chat pada WhatsApp bot secara real-time.
- Mengelola parameter sistem bot seperti jam kerja operasional, status pemeliharaan (maintenance), dan pesan selamat datang kustom.
- Mengelola keuangan personal dan pengingat yang terdaftar pada sistem utama.

Sistem masuk dirancang eksklusif untuk admin, sehingga opsi pendaftaran umum ditiadakan pada portal ini guna menjaga keamanan akses konsol bot.

---

## ✨ Fitur Utama

### 1. Portal Masuk Khusus Admin
- **Hanya Login** — Pendaftaran publik dinonaktifkan untuk membatasi kontrol bot hanya ke user administratif resmi (seperti `super_admin` yang di-seed di awal).
- **Tab Masuk Ganda** — Mendukung masuk manual (email & kata sandi) atau masuk secara instan via scan QR Code WhatsApp.

### 2. Panel Ringkasan Dashboard (Overview)
- **Grafik Recharts Interaktif** — Visualisasi kurva total pesan masuk (*Statistik Aktivitas*) yang responsif.
- **WhatsApp Chat Link Quick-Action** — Tombol tautan instan ke nomor WhatsApp bot untuk interaksi chat langsung.

### 3. Pengaturan Parameter Bot (Bot Configurations)
- **Status Operasional** — Sakelar mode pemeliharaan bot (*maintenance mode*).
- **Waktu Efektif Kerja** — Menyesuaikan hari kerja operasional (Senin s.d. Minggu) dan rentang jam aktif pelayanan bot.
- **Pesan Sambutan Kustom** — Mengubah pesan teks yang akan dikirim secara otomatis oleh bot saat menyambut pengguna baru di WhatsApp.

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Versi | Fungsi |
| :--- | :---: | :--- |
| **Next.js** | 16.3.0 | Framework React tingkat produksi dengan App Router |
| **React** | 19.2.8 | Library UI berbasis komponen deklaratif |
| **TailwindCSS** | 4.3.0 | CSS framework utilitas generasi v4 dengan performa tinggi |
| **Shadcn/ui + Radix** | 4.16.1 | Library komponen UI primitif unstyled yang mudah disesuaikan |
| **Recharts** | 3.8.0 | Library grafik visualisasi data modular untuk React |
| **lucide-react** | 1.28.0 | Library ikon vektor SVG yang konsisten dan ringan |
| **cookies-next** | 6.1.1 | Adapter penanganan cookie aman sisi klien dan server |

---

## 🔒 Arsitektur Autentikasi & Token Rotation

Aplikasi ini mengimplementasikan mekanisme **Sliding Session** jangka panjang (Instagram/TikTok-style):
1. **Penyimpanan Token** — `accessToken` disimpan dalam cookie selama 7 hari, dan `refreshToken` disimpan selama 365 hari.
2. **Proactive Token Refresh** — `api-client` mendeteksi jika `accessToken` kosong/kedaluwarsa namun `refreshToken` masih ada. Sebelum mengirim request ke API backend, `apiFetch` memanggil endpoint `/auth/refresh` secara transparan terlebih dahulu untuk meminimalkan latensi respons dan mengantisipasi error 401.

---

## 📁 Struktur Direktori

```
apps/web/dashboard/
├── public/                       # Aset publik statis (favicon, logo, dll.)
├── src/
│   ├── app/                      # Next.js App Router Pages
│   │   ├── dashboard/            # Layout dashboard admin, overview, & setting bot
│   │   ├── login/                # Halaman login khusus admin (manual / QR code)
│   │   ├── layout.tsx            # Global layout wrapper
│   │   └── page.tsx              # Root index redirect handler
│   ├── components/               # Komponen UI modular
│   │   ├── ui/                   # Komponen Shadcn UI primitif
│   │   └── app-sidebar.tsx       # Sidebar navigasi admin
│   └── lib/                      # Client API fetch adapter & utility
├── package.json
└── tsconfig.json
```

---

## 📄 Konfigurasi Lingkungan

Salin contoh variabel lingkungan dan sesuaikan nilainya:

```bash
cp apps/web/dashboard/.env.example apps/web/dashboard/.env.local
```

| Variabel | Deskripsi | Contoh |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Endpoint utama REST API Backend | `http://localhost:3001/api` |

---

## ▶️ Menjalankan Secara Lokal

Semua perintah dijalankan dari **direktori root** monorepo:

```bash
# Menjalankan development server dashboard
npm run dev:dashboard

# Membuild untuk produksi
npm run build:dashboard

# Menjalankan hasil build
npm run start:dashboard
```

---

## ☁️ Build & Deployment

Aplikasi Next.js ini siap di-deploy secara serverless pada **Netlify**:

- **Build Command**: `npm --prefix apps/web/dashboard run build`
- **Publish Directory**: `apps/web/dashboard/.next`
