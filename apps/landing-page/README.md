# 🌐 Landing Page — JustBot WhatsApp

**Halaman pemasaran publik platform JustBot yang modern, responsif, dan multi-bahasa.**  
Dibangun dengan React, Vite, TailwindCSS v4, dan Framer Motion untuk pengalaman visual yang premium.

[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![i18next](https://img.shields.io/badge/i18next-26A69A?style=flat-square&logo=i18next&logoColor=white)](https://www.i18next.com/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)](https://www.netlify.com/)

---

## 📋 Daftar Isi

- [Gambaran Umum](#-gambaran-umum)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Direktori](#-struktur-direktori)
- [Halaman & Komponen](#-halaman--komponen)
- [Internasionalisasi (i18n)](#-internasionalisasi-i18n)
- [Routing](#-routing)
- [Konfigurasi Lingkungan](#-konfigurasi-lingkungan)
- [Menjalankan Secara Lokal](#-menjalankan-secara-lokal)
- [Build & Deployment](#-build--deployment)

---

## 🌐 Gambaran Umum

`apps/landing-page` adalah antarmuka web publik yang berfungsi sebagai wajah dari platform JustBot. Halaman ini menampilkan fitur-fitur unggulan, demonstrasi langsung, dan testimoni pengguna untuk menarik calon pengguna baru.

Aplikasi ini sepenuhnya **static** dan **berdiri sendiri** — tidak membutuhkan koneksi ke `bot-service` maupun `api` untuk berfungsi. Dapat di-deploy ke Netlify sebagai **Static Site** dengan CDN global.

### Karakteristik Desain

- **Dark mode** sebagai tema default dengan palet warna yang dikurasi
- **Micro-animations** di setiap elemen interaktif menggunakan Framer Motion
- **Fully responsive** untuk semua ukuran layar (mobile-first)
- **Multi-bahasa** — mendukung lebih dari satu bahasa melalui i18next

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Versi | Fungsi |
| :--- | :---: | :--- |
| **React** | ^19.2 | Library UI komponen berbasis virtual DOM |
| **Vite** | ^8.2 | Build tool dan dev server generasi berikutnya |
| **TypeScript** | ^5.9 | Type safety di seluruh codebase frontend |
| **TailwindCSS** | ^4.3 | Utility-first CSS framework |
| **Framer Motion** | ^12.43 | Library animasi deklaratif untuk React |
| **i18next** | ^26.3 | Framework internasionalisasi |
| **react-i18next** | ^17.0 | Binding i18next untuk React |
| **i18next-browser-languagedetector** | ^8.2 | Deteksi bahasa otomatis dari browser |
| **lucide-react** | ^1.28 | Library ikon SVG yang konsisten |
| **clsx** | ^2.1 | Utility untuk class name conditional |
| **tailwind-merge** | ^3.6 | Merge Tailwind class tanpa konflik |

---

## 📁 Struktur Direktori

```
apps/landing-page/
├── index.html              # Entry point HTML
├── vite.config.ts          # Konfigurasi Vite
├── tsconfig.json           # Konfigurasi TypeScript
├── netlify.toml            # Konfigurasi deployment Netlify
│
├── public/                 # Aset statis yang tidak diproses Vite
│   └── (favicon, robots.txt, dll.)
│
└── src/
    ├── main.tsx            # React DOM render entry point
    ├── App.tsx             # Root component & client-side router
    ├── index.css           # Global CSS & Tailwind directives
    │
    ├── i18n.ts             # Konfigurasi i18next & terjemahan
    │
    ├── components/         # UI Components yang dapat digunakan ulang
    │   ├── Navbar.tsx          # Navigasi utama dengan mobile menu
    │   ├── Hero.tsx            # Seksi hero dengan CTA utama
    │   ├── FeaturesGrid.tsx    # Grid fitur-fitur unggulan bot
    │   ├── LiveDemoSection.tsx # Demonstrasi interaktif bot
    │   ├── TestimonialsSection.tsx # Testimoni pengguna
    │   └── Footer.tsx          # Footer dengan link & informasi
    │
    └── pages/              # Halaman statis (konten legal)
        ├── PrivacyPolicyPage.tsx  # Halaman Kebijakan Privasi
        └── TermsOfServicePage.tsx # Halaman Syarat & Ketentuan
```

---

## 🧩 Halaman & Komponen

### Halaman Utama (`/`)

Dibangun dari rangkaian komponen yang disusun secara vertikal:

| Komponen | Deskripsi |
| :--- | :--- |
| `<Navbar />` | Navigasi sticky dengan efek blur pada scroll dan menu hamburger untuk mobile |
| `<Hero />` | Seksi pembuka dengan headline, subtext, tombol CTA, dan animasi masuk |
| `<FeaturesGrid />` | Grid 9 kartu fitur modul AI dengan ikon dan deskripsi singkat |
| `<LiveDemoSection />` | Simulasi percakapan bot secara interaktif |
| `<TestimonialsSection />` | Karousel atau grid testimoni dari pengguna |
| `<Footer />` | Informasi hak cipta, link media sosial, dan link ke halaman legal |

### Halaman Legal

| Path | Komponen | Deskripsi |
| :--- | :--- | :--- |
| `/privacy` | `<PrivacyPolicyPage />` | Halaman Kebijakan Privasi lengkap |
| `/terms` | `<TermsOfServicePage />` | Halaman Syarat & Ketentuan Penggunaan |

---

## 🌍 Internasionalisasi (i18n)

Landing page mendukung **multi-bahasa** menggunakan i18next dengan deteksi bahasa browser otomatis.

Semua string terjemahan terdefinisi di dalam `src/i18n.ts`. Untuk menambahkan bahasa baru:

1. Buka file `src/i18n.ts`
2. Tambahkan resource bahasa baru di dalam objek `resources`
3. Daftarkan kode bahasa di array `supportedLngs`

**Menggunakan terjemahan di komponen:**

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('hero.title')}</h1>;
}
```

---

## 🔀 Routing

Landing page menggunakan **client-side routing sederhana** tanpa library router eksternal, diimplementasikan langsung di `App.tsx` menggunakan `window.location.pathname` dan event listener `popstate`.

| Kondisi | Komponen yang Dirender |
| :--- | :--- |
| `pathname === '/'` | Halaman utama (semua sections) |
| `pathname === '/privacy'` | `<PrivacyPolicyPage />` |
| `pathname === '/terms'` | `<TermsOfServicePage />` |

> Konfigurasi `netlify.toml` menyertakan redirect rule `/* → /index.html` untuk memastikan deep link berfungsi dengan benar di Netlify.

---

## 🔐 Konfigurasi Lingkungan

Landing page tidak membutuhkan variabel lingkungan untuk berfungsi karena sepenuhnya static. Namun, jika diperlukan konfigurasi runtime (seperti URL API), buat file `.env` di direktori ini:

```env
# Opsional — URL API backend jika diperlukan di masa mendatang
VITE_API_URL=https://your-api-site.netlify.app
```

> Semua variabel lingkungan Vite harus diawali dengan prefix `VITE_` agar dapat diakses di kode frontend.

---

## ▶️ Menjalankan Secara Lokal

```bash
# Dari direktori apps/landing-page
npm install
npm run dev
```

Aplikasi akan tersedia di `http://localhost:5173`.

### Perintah yang Tersedia

| Perintah | Fungsi |
| :--- | :--- |
| `npm run dev` | Menjalankan dev server dengan Hot Module Replacement (HMR) |
| `npm run build` | Build production bundle ke direktori `dist/` |
| `npm run preview` | Preview hasil build production secara lokal |

---

## 📦 Build & Deployment

### Build Production

```bash
npm run build
```

Hasil build tersedia di direktori `dist/`. Seluruh aset akan dioptimasi, di-minify, dan di-hash untuk caching yang optimal.

### Deployment ke Netlify

Landing page di-deploy sebagai **Static Site** di Netlify.

**Langkah deployment:**

1. Push repositori ke GitHub.
2. Buat site baru di [app.netlify.com](https://app.netlify.com).
3. Konfigurasi build settings:
   - **Base directory:** `apps/landing-page`
   - **Build command:** `npm run build`
   - **Publish directory:** `apps/landing-page/dist`
4. Deploy.

Konfigurasi `netlify.toml` yang telah tersedia akan menangani redirect rule secara otomatis untuk mendukung client-side routing.

---

## 🔗 Referensi

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [TailwindCSS v4 Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [i18next Documentation](https://www.i18next.com/)
- [Netlify Documentation](https://docs.netlify.com/)

---

<div align="center">

Bagian dari [JustBot WhatsApp Monorepo](../../README.md)

Dikembangkan oleh **[Nadhif Ararya (Justdhif)](https://github.com/Justdhif)**

</div>
