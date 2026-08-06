# 📊 Manager Portal — JustBot Registration Console

**Portal web pendaftaran mandiri khusus bagi Manager untuk melakukan registrasi dan mengelola data personal (keuangan & pengingat).**  
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

`apps/web/manager` adalah portal web mandiri bagi pengguna umum/manager yang ingin:
- Mendaftar akun baru secara instan (pendaftaran otomatis dianggap login).
- Mencatat laporan keuangan pribadi (pemasukan, pengeluaran, saldo) secara real-time.
- Menyimpan data pengingat (agenda/notifikasi) yang akan dikirim secara otomatis ke WhatsApp pengguna.

Portal ini ditiadakan dari akses menu "Pengaturan Bot" karena konfigurasi bot bersifat internal administratif (dikelola oleh Admin). Di samping pendaftaran murni, disediakan opsi masuk darurat jika cookie pengguna terhapus.

---

## ✨ Fitur Utama

### 1. Registrasi Akun Instan (Manager Register)
- **Registrasi & Auto-Login** — Halaman utama adalah form pendaftaran akun manager (role default: `user`). Setelah mendaftar berhasil, token langsung disimpan dan pengguna langsung dialihkan masuk.
- **Emergency Login Fallback** — Tombol tautan di bagian bawah jika pengguna tidak sengaja membersihkan cookie browser dan ingin masuk kembali ke akun lama mereka.

### 2. Panel Ringkasan Dashboard (Overview)
- **Grafik Keuangan Recharts** — Visualisasi kurva total pesan masuk (*Statistik Aktivitas*) yang responsif.
- **Widget Kalender & Timeline Agenda** — Kalender bulan berjalan dengan timeline agenda pengingat harian.
- **Widget Transaksi Finansial** — Visualisasi transaksi masuk/keluar terfilter harian secara interaktif.

### 3. Manajemen Keuangan & Pengingat
- **Arus Kas Terpantau** — Pencatatan transaksi pemasukan (*income*) dan pengeluaran (*expense*).
- **Notifikasi Push WhatsApp** — Integrasi pengiriman pengingat langsung ke nomor WhatsApp terdaftar secara tepat waktu.

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
apps/web/manager/
├── public/                       # Aset publik statis (favicon, logo, dll.)
├── src/
│   ├── app/                      # Next.js App Router Pages
│   │   ├── dashboard/            # Layout dashboard manager, overview (tanpa menu pengaturan bot)
│   │   ├── register/             # Halaman registrasi utama khusus manager (dengan fallback login)
│   │   ├── layout.tsx            # Global layout wrapper
│   │   └── page.tsx              # Root index redirect handler (mengarah ke /register jika tidak ada token)
│   ├── components/               # Komponen UI modular
│   │   ├── ui/                   # Komponen Shadcn UI primitif
│   │   └── app-sidebar.tsx       # Sidebar navigasi manager (tanpa Pengaturan Bot)
│   └── lib/                      # Client API fetch adapter & utility
├── package.json
└── tsconfig.json
```

---

## 📄 Konfigurasi Lingkungan

Salin contoh variabel lingkungan dan sesuaikan nilainya:

```bash
cp apps/web/manager/.env.example apps/web/manager/.env.local
```

| Variabel | Deskripsi | Contoh |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Endpoint utama REST API Backend | `http://localhost:3001/api` |

---

## ▶️ Menjalankan Secara Lokal

Semua perintah dijalankan dari **direktori root** monorepo:

```bash
# Menjalankan development server portal manager
npm run dev:manager

# Membuild untuk produksi
npm run build:manager

# Menjalankan hasil build
npm run start:manager
```

---

## ☁️ Build & Deployment

Aplikasi Next.js ini siap di-deploy secara serverless pada **Netlify**:

- **Build Command**: `npm --prefix apps/web/manager run build`
- **Publish Directory**: `apps/web/manager/.next`
