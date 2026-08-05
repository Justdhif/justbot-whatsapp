# 📊 Dashboard — JustBot Control Portal

**Portal web dashboard administratif dan pengelolaan data personal untuk platform JustBot.**  
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

`apps/dashboard` adalah panel kontrol utama yang digunakan oleh pemilik akun JustBot untuk:
- Memantau aktivitas interaksi chat pada WhatsApp bot secara real-time.
- Mengelola catatan keuangan pribadi/bisnis (arus kas) yang dicatat secara manual maupun otomatis via chat.
- Mengatur agenda pengingat tugas harian beserta penjadwalan pengiriman notifikasinya ke WhatsApp.
- Mengonfigurasi parameter sistem bot seperti jam kerja operasional, status pemeliharaan (maintenance), dan pesan selamat datang kustom.

Portal ini dirancang dengan tema gelap minimalis modern (*premium dark-mode*) yang menggunakan aksen warna hijau WhatsApp asli (`#25D366`), memberikan kesan visual yang premium, elegan, dan fungsional.

---

## ✨ Fitur Utama

### 1. Portal Autentikasi Terintegrasi
- **Tab Masuk Ganda** — Mendukung masuk secara manual (email & kata sandi) atau masuk secara instan via scan QR Code WhatsApp.
- **Toggle Visibility Password** — Antarmuka ramah pengguna dengan tombol tampil/sembunyikan kata sandi.
- **Registrasi Akun Mandiri** — Form pendaftaran akun baru terintegrasi langsung dengan database profile API.

### 2. Panel Ringkasan Dashboard (Overview)
- **Grafik Recharts Interaktif** — Visualisasi kurva total pesan masuk (*Statistik Aktivitas*) yang responsif dengan filter dinamis 7 Hari, 30 Hari, dan 90 Hari.
- **Daftar Modul Bot** — Galeri horizontal scroller dengan efek *side-fade* halus yang menampilkan penjelasan kemampuan 10 modul andalan JustBot.
- **Widget Kalender & Timeline Agenda** — Kalender bulan berjalan yang menyoroti hari aktif, tersambung ke timeline agenda/pengingat harian dengan tanda centang indikator.
- **Widget Transaksi Finansial** — Visualisasi transaksi masuk/keluar terfilter harian secara interaktif di bawah widget agenda.
- **WhatsApp Chat Link Quick-Action** — Tombol tautan instan ke nomor WhatsApp bot untuk interaksi chat langsung.

### 3. Manajemen Keuangan (Finance Tracker)
- **Arus Kas Terpantau** — Pencatatan transaksi pemasukan (*income*) dan pengeluaran (*expense*).
- **Statistik Persentase Saldo** — Menghitung persentase tabungan (*saved*) dan pengeluaran (*spent*) secara kumulatif.
- **Kategori & Deskripsi** — Organisasi transaksi berdasarkan filter kategori tertentu untuk pelaporan bulanan.

### 4. Manajemen Pengingat (Reminders System)
- **Penyusunan Tugas** — Membuat pengingat agenda baru beserta spesifikasi waktu pengiriman notifikasinya.
- **Notifikasi Push WhatsApp** — Integrasi pengiriman pengingat langsung ke nomor WhatsApp terdaftar secara tepat waktu.

### 5. Pengaturan Parameter Bot (Bot Configurations)
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
| **class-variance-authority**| 0.7.1 | Helper pembuat variasi style class Tailwind |

---

## 🔒 Arsitektur Autentikasi & Token Rotation

Aplikasi ini mengimplementasikan mekanisme **Sliding Session** yang aman:
1. **Penyimpanan Token** — `accessToken` dan `refreshToken` disimpan di dalam cookie browser yang terenkripsi.
2. **Layout Auth Guard Check** — Layout dashboard memeriksa keberadaan `accessToken` dan `refreshToken` saat halaman dimuat ulang.
3. **Interseptor Otomatis (Token Rotation)** — Jika request API `/users/me` mengembalikan status `401 Unauthorized` karena `accessToken` kedaluwarsa, `api-client` akan mengirim request `POST /auth/refresh` membawa `refreshToken` untuk mendapatkan pasangan token baru.
4. **Silently Retry Request** — Request asli diulang secara transparan menggunakan token baru tanpa memaksa pengguna dialihkan ke halaman login, kecuali jika session benar-benar berakhir/tidak valid.

---

## 📁 Struktur Direktori

```
apps/dashboard/
├── public/                       # Aset publik statis (favicon, logo, dll.)
├── src/
│   ├── app/                      # Direktori utama Next.js App Router
│   │   ├── dashboard/            # Layout dashboard berproteksi & sub-pages
│   │   │   ├── finance/          # Modul pengelolaan keuangan
│   │   │   ├── reminders/        # Modul pengelolaan agenda
│   │   │   ├── settings/         # Modul konfigurasi parameter bot
│   │   │   └── page.tsx          # Halaman ringkasan dashboard (Overview)
│   │   ├── login/                # Halaman portal masuk & daftar akun
│   │   ├── globals.css           # Integrasi variabel CSS & tokens Tailwind v4
│   │   └── layout.tsx            # Metadata HTML & wrapper root
│   │
│   ├── components/               # Komponen UI
│   │   ├── ui/                   # Komponen primitif shadcn (sidebar, chart, dll.)
│   │   └── app-sidebar.tsx       # Komponen navigasi panel samping dashboard
│   │
│   └── lib/                      # Utilitas & Client adapter
│       ├── api-client.ts         # Wrapper fetch API dengan token rotation
│       └── utils.ts              # Helper penggabungan kelas styling Tailwind
│
├── package.json                  # Konfigurasi workspace scripts & deps
└── tsconfig.json                 # Konfigurasi TypeScript compiler
```

---

## ⚙️ Konfigurasi Lingkungan

Salin `.env.example` ke `.env.local` dan sesuaikan nilainya:

```bash
# URL dasar REST API backend NestJS
NEXT_PUBLIC_API_URL=https://justbot-api.netlify.app/api
```

---

## 💻 Menjalankan Secara Lokal

1. Pastikan Anda berada di root monorepo.
2. Jalankan server pengembangan untuk dashboard:
   ```bash
   npm run dev:dashboard
   ```
3. Buka browser pada alamat [http://localhost:3000](http://localhost:3000).

---

## 🚀 Build & Deployment

### Build untuk Produksi
Untuk melakukan kompilasi build produksi secara lokal:
```bash
npm run build:dashboard
```

### Serverless Deployment
Aplikasi ini dikonfigurasi untuk langsung di-deploy ke **Netlify** menggunakan Next.js Runtime:
1. Hubungkan repository GitHub ke dashboard Netlify.
2. Atur parameter build berikut:
   - **Build Command**: `npm --prefix apps/dashboard run build`
   - **Publish Directory**: `apps/dashboard/.next`
3. Tambahkan environment variable `NEXT_PUBLIC_API_URL` pada panel Netlify.
