# ⚡ API — JustBot Backend Service

**Backend REST API yang menyediakan lapisan persistensi data dan autentikasi untuk platform JustBot.**  
Dibangun dengan NestJS, Drizzle ORM, dan Neon Serverless Postgres dengan keamanan berlapis.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Neon Postgres](https://img.shields.io/badge/Neon_Postgres-00E699?style=flat-square&logo=postgresql&logoColor=black)](https://neon.tech/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Netlify](https://img.shields.io/badge/Netlify_Functions-00C7B7?style=flat-square&logo=netlify&logoColor=white)](https://docs.netlify.com/functions/overview/)

---

## 📋 Daftar Isi

- [Gambaran Umum](#-gambaran-umum)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Arsitektur Internal](#-arsitektur-internal)
- [Struktur Direktori](#-struktur-direktori)
- [Modul Fungsional](#-modul-fungsional)
- [Keamanan & Middleware Global](#-keamanan--middleware-global)
- [Konfigurasi Lingkungan](#-konfigurasi-lingkungan)
- [Database Management](#-database-management)
- [Menjalankan Secara Lokal](#-menjalankan-secara-lokal)
- [Build & Deployment](#-build--deployment)
- [Konvensi API Response](#-konvensi-api-response)

---

## 🌐 Gambaran Umum

`apps/api` adalah layer backend yang bertanggung jawab atas:

- **Autentikasi & Otorisasi** — Implementasi JWT Sliding Session yang menyerupai perilaku "selalu login" ala Instagram/TikTok
- **Manajemen Data Pengguna** — CRUD profil dan data user
- **Fitur Keuangan** — Pencatatan dan analisis transaksi keuangan
- **Manajemen Pengingat** — Penyimpanan dan pengelolaan agenda pengguna

API ini dapat dikonsumsi oleh `bot-service` maupun aplikasi klien lainnya, serta dirancang untuk berjalan sebagai **Netlify Serverless Function**.

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Versi | Fungsi |
| :--- | :---: | :--- |
| **NestJS** | ^10.4 | Framework backend berbasis modul yang scalable |
| **TypeScript** | ^5.7 | Type safety di seluruh codebase |
| **Drizzle ORM** | ^0.38 | Type-safe SQL query builder |
| **Neon Serverless** | ^0.10 | Driver PostgreSQL untuk lingkungan serverless |
| **Passport + JWT** | ^10.0 | Strategi autentikasi berbasis token |
| **@nestjs/throttler** | ^6.2 | Rate limiting untuk proteksi API |
| **Helmet** | ^8.0 | Keamanan HTTP header |
| **bcryptjs** | ^2.4 | Hashing password yang aman |
| **class-validator** | ^0.14 | Validasi DTO secara deklaratif |
| **Joi** | ^17.13 | Validasi skema variabel lingkungan |
| **Serverless HTTP** | ^3.2 | Adapter NestJS ke Netlify Functions |

---

## 🏗️ Arsitektur Internal

API ini mengikuti arsitektur modular standar NestJS dengan lapisan middleware global yang terpusat:

```
src/
│
├── main.ts               # Bootstrap NestJS application
├── lambda.ts             # Netlify Function adapter (serverless entry point)
├── app.module.ts         # Root module — mengintegrasikan seluruh modul
│
├── config/               # Konfigurasi Aplikasi
│   ├── app.config.ts     # Konfigurasi app & JWT
│   └── env.validation.ts # Validasi env menggunakan Joi schema
│
├── database/             # Database Layer
│   ├── database.module.ts    # Modul koneksi Neon Postgres
│   └── schema/               # Drizzle ORM schema definitions
│
├── common/               # Shared Infrastructure
│   ├── guards/
│   │   └── jwt-auth.guard.ts      # Global JWT Guard
│   ├── filters/
│   │   └── http-exception.filter.ts # Global error handler
│   ├── interceptors/
│   │   └── response.interceptor.ts  # Global response formatter
│   └── decorators/
│       └── public.decorator.ts      # @Public() route decorator
│
└── modules/              # Feature Modules
    ├── auth/             # Autentikasi (Login, Register, Refresh Token)
    ├── users/            # Manajemen User
    ├── finance/          # Manajemen Keuangan
    └── reminders/        # Manajemen Pengingat
```

---

## 🧩 Modul Fungsional

### `auth` — Autentikasi

Mengimplementasikan strategi **JWT Sliding Session**:
- Access Token berumur pendek (15 menit)
- Refresh Token berumur panjang (30 hari) dengan rotasi otomatis
- Setiap refresh menghasilkan pasangan token baru (refresh token lama diinvalidasi)

**Endpoint utama:**
| Method | Path | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Registrasi pengguna baru |
| `POST` | `/auth/login` | Login & mendapatkan token |
| `POST` | `/auth/refresh` | Rotasi access & refresh token |
| `POST` | `/auth/logout` | Invalidasi refresh token |

---

### `users` — Manajemen Pengguna

Menangani operasi CRUD untuk data profil pengguna yang terautentikasi.

**Endpoint utama:**
| Method | Path | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/users/me` | Mendapatkan profil pengguna saat ini |
| `PATCH` | `/users/me` | Memperbarui data profil |

---

### `finance` — Manajemen Keuangan

Menyimpan dan menganalisis catatan transaksi keuangan pengguna, terintegrasi dengan modul Finance Manager pada `bot-service`.

---

### `reminders` — Manajemen Pengingat

Menyimpan agenda dan pengingat pengguna yang dibuat melalui bot, memungkinkan persistensi data lintas sesi percakapan.

---

## 🔒 Keamanan & Middleware Global

Seluruh keamanan dikonfigurasi secara global di `app.module.ts`:

| Mekanisme | Implementasi | Keterangan |
| :--- | :--- | :--- |
| **JWT Auth Guard** | `@nestjs/passport` | Semua route terproteksi secara default. Gunakan `@Public()` untuk pengecualian |
| **HTTP Security Headers** | `Helmet` | Proteksi dari XSS, clickjacking, dan serangan header umum |
| **Rate Limiting** | `@nestjs/throttler` | Maksimum 100 request per 15 menit per IP |
| **Input Validation** | `class-validator` + `ValidationPipe` | Payload asing otomatis ditolak (`forbidNonWhitelisted: true`) |
| **Response Interceptor** | Custom `ResponseInterceptor` | Format respons API yang konsisten di seluruh endpoint |
| **Error Filter** | Custom `HttpExceptionFilter` | Penanganan error terpusat dengan format yang seragam |
| **Password Hashing** | `bcryptjs` | Hashing satu arah sebelum penyimpanan ke database |

---

## 🔐 Konfigurasi Lingkungan

Salin file contoh dan isi dengan nilai yang sesuai:

```bash
cp .env.example .env
```

| Variabel | Wajib | Deskripsi |
| :--- | :---: | :--- |
| `NODE_ENV` | ✅ | `development` atau `production` |
| `PORT` | ✅ | Port server (default: `3001`) |
| `APP_NAME` | ✅ | Nama aplikasi (default: `justbot-api`) |
| `DATABASE_URL` | ✅ | Connection string Neon Postgres |
| `JWT_ACCESS_SECRET` | ✅ | Secret untuk access token (min. 32 karakter) |
| `JWT_ACCESS_EXPIRES_IN` | ✅ | Masa berlaku access token (contoh: `15m`) |
| `JWT_REFRESH_SECRET` | ✅ | Secret untuk refresh token (min. 32 karakter) |
| `JWT_REFRESH_EXPIRES_IN` | ✅ | Masa berlaku refresh token (contoh: `30d`) |
| `CORS_ORIGINS` | ✅ | Daftar origin yang diizinkan, pisahkan dengan koma |
| `THROTTLE_TTL` | ⬜ | Window rate limiting dalam milidetik (default: `900000`) |
| `THROTTLE_LIMIT` | ⬜ | Maks request per window (default: `100`) |

**Contoh konfigurasi `.env`:**

```env
NODE_ENV=development
PORT=3001
APP_NAME=justbot-api

DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

JWT_ACCESS_SECRET=akses_secret_yang_sangat_panjang_dan_aman_minimal_32_karakter
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=refresh_secret_yang_sangat_panjang_dan_aman_minimal_32_karakter
JWT_REFRESH_EXPIRES_IN=30d

CORS_ORIGINS=http://localhost:3000,http://localhost:5173

THROTTLE_TTL=900000
THROTTLE_LIMIT=100
```

---

## 🗄️ Database Management

Drizzle ORM digunakan sebagai query builder dengan Drizzle Kit sebagai tool manajemen migrasi.

```bash
# Generate file migrasi dari perubahan schema
npm run db:generate

# Push schema langsung ke database (tanpa migrasi, cocok untuk development)
npm run db:push

# Buka GUI Drizzle Studio untuk inspeksi data
npm run db:studio

# Reset seluruh data dan re-push schema (DESTRUCTIVE — hati-hati di production)
npm run db:reset
```

> ⚠️ **Perhatian:** `db:reset` akan menghapus seluruh data di database. Jangan jalankan di lingkungan production.

---

## ▶️ Menjalankan Secara Lokal

### Dari direktori `apps/api`

```bash
# Install dependensi
npm install

# Jalankan development server dengan hot-reload
npm run dev
```

### Dari direktori root monorepo

```bash
npm run dev:api
```

Server akan berjalan di `http://localhost:3001`.

---

## 📦 Build & Deployment

### Build Production

```bash
npm run build
```

Output tersedia di direktori `dist/`.

### Deployment ke Netlify

API dikonfigurasi untuk berjalan sebagai **Netlify Function** melalui `netlify.toml` dan adapter di `src/lambda.ts`.

**Langkah deployment:**

1. Push repositori ke GitHub.
2. Buat site baru di [app.netlify.com](https://app.netlify.com).
3. Atur **Base directory** ke `apps/api`.
4. Tambahkan seluruh Environment Variables dari `.env` ke dashboard Netlify.
5. Deploy.

Seluruh endpoint API akan dapat diakses melalui:

```
https://<your-api-site>.netlify.app/.netlify/functions/api/<endpoint>
```

---

## 📐 Konvensi API Response

Seluruh respons API menggunakan format yang konsisten berkat `ResponseInterceptor`:

**Respons Sukses:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... }
}
```

**Respons Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Pesan error yang deskriptif",
  "errors": [ ... ]
}
```

---

## 🔗 Referensi

- [NestJS Documentation](https://docs.nestjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Neon Serverless Documentation](https://neon.tech/docs/serverless/serverless-driver)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)

---

<div align="center">

Bagian dari [JustBot WhatsApp Monorepo](../../README.md)

Dikembangkan oleh **[Nadhif Ararya (Justdhif)](https://github.com/Justdhif)**

</div>
