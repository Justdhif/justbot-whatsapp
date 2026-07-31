<div align="center">

```text
       ██╗██╗  ██╗███████╗████████╗██████╗  ██████╗ ████████╗
       ██║██║  ██║██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗╚══██╔══╝
       ██║██║  ██║███████╗   ██║   ██████╔╝██║   ██║   ██║   
  ██   ██║██║  ██║╚════██║   ██║   ██╔══██╗██║   ██║   ██║   
  ╚█████╔╝╚█████╔╝███████║   ██║   ██████╔╝╚██████╔╝   ██║   
   ╚════╝  ╚════╝ ╚══════╝   ╚═╝   ╚═════╝  ╚═════╝    ╚═╝   
```

# 🤖 JustBot WhatsApp Multi-Module AI
### *The Ultimate All-in-One WhatsApp Super Bot Powered by Groq AI & Fastify*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://www.fastify.io/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-FF4500?style=for-the-badge&logo=openai&logoColor=white)](https://groq.com/)
[![Meta WhatsApp API](https://img.shields.io/badge/WhatsApp_Cloud_API-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://developers.facebook.com/)
[![Deploy on Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)

*Capek jawab chat satu-satu? Mau bot yang pinter koding, ngatur duit, nulis script TikTok, sampe jawab pertanyaan romantis tentang sang pujaan hati?*  
**Selamat! Kamu nemu mahakarya bot WhatsApp paling canggih, kenceng, dan penuh kasih sayang ini!** 🚀💖

</div>

---

## 🌟 Mengapa JustBot Sangat Spesial?

Bukan sekadar bot WhatsApp biasa yang cuma bisa jawab *"Halo kak, ada yang bisa dibantu?"*. **JustBot** dibekali dengan **Groq AI (Llama-3.3 70B)** yang super ngebut, arsitektur **Monorepo**, serta fitur **Interactive Mode State Machine** yang bikin interaksi chat berasa kaya lagi ngobrol sama Jarvis!

### 🎯 Fitur Unggulan Utama:
- 🚀 **Super Fast AI Engine**: Menggunakan SDK Groq Llama-3.3 70B dengan kecepatan respon di bawah 1 detik!
- 🎛️ **Stateful Interactive Mode**: Masuk ke mode khusus (Coding, Finance, dll) cuma dengan sekali klik tombol `🚀 Start Mode` dan keluar pakai `🔴 Exit Mode`.
- 📋 **Interactive UI Card**: Dilengkapi dengan Menu Dropdown List, Quick Reply Buttons, dan Banner Visual HD.
- ⏰ **Smart Operational Hours (Quota Saver)**: Bot otomatis libur sesuai jadwal WIB biar kuota gratis 1.000 chat/bulan Meta API kamu gak bocor!
- 💖 **Special Romance Easter Egg**: Coba tanya tentang *"Jujul"* atau *"Julia irya salsabillah"*, dan rasakan kehangatan puisi cinta puitis ciptaan sang Developer (Nadhif)! 🥰

---

## 🧩 9 Modul AI Kebanggaan

| Modul | Perintah | Deskripsi Lucu & Canggih |
| :--- | :--- | :--- |
| 💻 **Coding Assistant** | `!coding` | Teman ngoding yang gak pernah judge kodingan kamu yang spageti. |
| 💰 **Finance Manager** | `!finance` | Penasihat keuangan biar gak jajan boba mulu tiap akhir bulan (Aturan 50/30/20). |
| 🎥 **Content Creator** | `!creator` | Pabrik ide konten viral TikTok/Reels lengkap sama Hook 3 detik bikin penonton terhipnotis. |
| 🌍 **Polyglot Translator** | `!translate` | Menterjemahkan bahasa planet apa aja secara alami tanpa kaku kaya Google Translate jaman dulu. |
| 📷 **OCR Scanner** | `!ocr` | Tukang rapiin teks dari foto struk belanjaan atau catatan tangan berantakan. |
| 📄 **PDF & Document AI** | `!pdf` | Asisten pemalas yang siap ngerangkum makalah 50 halaman jadi 3 baris. |
| 📧 **Executive Email** | `!email` | Merubah chatan santai *"bro gw gak masuk ya"* jadi surat izin korporat yang sangat elegan. |
| 📅 **Agenda & Reminder** | `!reminder` | Pengingat harian biar kamu gak lupa jadwal ngedate atau deadline tugas. |
| 🛠️ **Smart Utilities** | `!util` | Kalkulator serbaguna dan penjawab pertanyaan random kehidupan. |

---

## 🏗️ Struktur Monorepo

```text
justbot-whatsapp/
├── package.json               # Monorepo Workspaces Configuration
├── netlify.toml               # Netlify Functions Deployment Config
├── README.md                  # Mahakarya Dokumentasi Ini
└── apps/
    └── bot-service/           # Core Bot Service Engine
        ├── package.json
        ├── tsconfig.json
        ├── .env.example
        └── src/
            ├── index.ts       # Fastify Server & Netlify Function Export
            ├── config/        # Strict Zod Environment Validator
            ├── services/      # WhatsApp Cloud API & Groq LLM Client
            ├── routes/        # Webhook Verification & Listener
            └── modules/       # Modular AI Handlers
```

---

## 🚀 Cara Menjalankan Secara Lokal (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Justdhif/justbot-whatsapp.git
cd justbot-whatsapp
npm install
```

### 2. Setup Environment Variables
Buat file `.env` di dalam folder `apps/bot-service/.env`:

```env
PORT=3000
HOST=0.0.0.0

GROQ_API_KEY=your_groq_api_key_here
WA_VERIFY_TOKEN=your_whatsapp_verify_token_here
WA_PHONE_NUMBER_ID=your_whatsapp_phone_number_id_here
WA_CLOUD_API_ACCESS_TOKEN=your_whatsapp_cloud_api_access_token_here

# Operational Hours Config (WIB)
BOT_ENABLE_SCHEDULE=true
BOT_OPERATIONAL_START=08:00
BOT_OPERATIONAL_END=22:00
BOT_OPERATIONAL_DAYS=1,2,3,4,7   # (Jumat & Sabtu OFF)
```

### 3. Run Development Server
```bash
npm run dev:bot
```

---

## ☁️ Deployment (Netlify 100% Gratis)

Proyek ini dirancang agar **100% siap di-deploy** di **Netlify Functions**.

1. Push repositori ini ke GitHub.
2. Buka [app.netlify.com](https://app.netlify.com) -> **Import an existing project**.
3. Set **Base directory** ke `apps/bot-service`.
4. Masukkan Environment Variables dan klik **Deploy**!

---

## 💖 Special Dedication

> *"Di antara jutaan baris kode yang ditulis di dunia ini, ada satu nama yang menjadi inspirasi di balik setiap detak logika bot ini: **Julia Irya Salsabillah (Jujul)** — Sosok istimewa kelahiran 16 Juli 2009 dari SMKN 5 Balikpapan yang selalu menjadi kebanggaan sang Developer."* 🌹✨

---

<div align="center">

Crafted with ❤️ and ☕ by **[Nadhif Ararya (Justdhif)](https://github.com/Justdhif)**  
*Build for the future, code with love.*

</div>
