import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { processIncomingMessage, MODULE_DETAILS } from "../modules/router.js";
import axios from "axios";
import { getHelpMenu } from "../modules/utilities/utilities.handler.js";
import {
  getFinanceIntroMessage,
  processCuanBuddyCheck,
} from "../modules/finance/finance.handler.js";
import {
  sendWhatsAppMessage,
  sendWhatsAppImage,
  sendWhatsAppButtons,
  sendWhatsAppInteractiveList,
  sendWhatsAppSticker,
  uploadWhatsAppMedia,
} from "../services/whatsapp.service.js";
import { getUserSession, setUserActiveMode } from "../utils/session.js";
import { isBotOnline } from "../utils/schedule.js";
import {
  hasBeenNotifiedToday,
  markUserNotifiedToday,
} from "../utils/offNotificationStore.js";

// Module Banner Images mapping
const MODULE_BANNERS: Record<string, string> = {
  coding:
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
  finance:
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop",
  creator:
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
  translate:
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
  ocr: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
  pdf: "https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=1000&auto=format&fit=crop",
  email:
    "https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=1000&auto=format&fit=crop",
  reminder:
    "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1000&auto=format&fit=crop",
  util: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop",
};

interface WebhookQuery {
  "hub.mode"?: string;
  "hub.verify_token"?: string;
  "hub.challenge"?: string;
}

export async function webhookRoutes(fastify: FastifyInstance) {
  // GET /webhook - Meta WhatsApp Webhook Verification
  fastify.get(
    "/webhook",
    async (
      request: FastifyRequest<{ Querystring: WebhookQuery }>,
      reply: FastifyReply,
    ) => {
      const mode = request.query["hub.mode"];
      const token = request.query["hub.verify_token"];
      const challenge = request.query["hub.challenge"];

      if (mode && token) {
        if (mode === "subscribe" && token === env.WA_VERIFY_TOKEN) {
          logger.info("✅ Webhook verified successfully!");
          return reply.status(200).send(challenge);
        } else {
          logger.warn("❌ Webhook verification failed: Token mismatch.");
          return reply.status(403).send("Verification token mismatch");
        }
      }

      return reply.status(400).send("Bad Request");
    },
  );

  // POST /webhook - Handle Incoming WhatsApp Messages & Profile Name Extraction
  fastify.post(
    "/webhook",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body: any = request.body;

      try {
        if (
          body.object &&
          body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
        ) {
          const valueObj = body.entry[0].changes[0].value;
          const messageObj = valueObj.messages[0];
          const from = messageObj.from;

          // Extract WhatsApp Profile Name from contact metadata sent by Meta
          const senderName = valueObj.contacts?.[0]?.profile?.name || "";

          // Dynamic Timezone detection based on phone number prefix or region
          // By default, Indonesian numbers are +62 (WIB = UTC+7, WITA = UTC+8, WIT = UTC+9)
          // Indonesia phone prefixes map closely to zones:
          // WITA (Bali, NTB, NTT, Kalimantan Timur/Selatan/Utara, Sulawesi): e.g., Kalimantan/Sulawesi/Bali numbers
          // WIT (Maluku, Papua): e.g., Maluku/Papua numbers
          // Since granular prefix lookup is complex, we can parse standard Indonesian timezone offsets:
          // We'll look at the user session or standard defaults:
          const session = getUserSession(from);

          // Simple heuristic for Indonesian regions if number matches common WITA / WIT prefixes
          // Or default to user settings. Let's make it smart:
          // WITA offset is +8, WIT offset is +9. Default WIB is +7.
          // We will default to WIB +7 unless specified, but let's check Kaltim (prefix matches or user can link/configure)
          // For Kaltim/WITA numbers, common prefixes can be mapped or we can do a smart lookup.
          // For now, let's detect WITA (+8) if number matches Kalimantan Timur/Sulawesi/Bali regions if possible.
          // Even simpler: since Balikpapan (Jujul's area) / Kalimantan Timur is WITA, let's check prefixes:
          // Common WITA/WIT prefixes or numbers. Let's allow detecting WITA (+8) for Kaltim/Sulawesi, or default to WIB (+7)
          let tzOffset = 7;
          let tzName = "WIB (Asia/Jakarta)";

          // Common Kalimantan Timur & WITA prefixes (e.g. Kartu As/Simpati/XL Kaltim: 081254, 081347, 082154, 085247, 085347, etc.)
          const isWitaPrefix =
            /^(6281254|6281347|6282154|6285247|6285347|6281349|6285246|6282153|6281253|6285250|6285251|6285252|628138|628538)/.test(
              from,
            );
          if (isWitaPrefix) {
            tzOffset = 8;
            tzName = "WITA (Asia/Makassar)";
          }

          // Save to session so we can display it in !menu
          session.timezoneOffset = tzOffset;
          session.timezoneName = tzName;

          // Gatekeeper: Check if Bot is currently OFF / Outside Operational Hours using user local timezone offset
          if (!isBotOnline(tzOffset)) {
            logger.info(
              { from, senderName, tzName },
              "🌙 Bot is currently OFF / Outside Operational Hours.",
            );

            if (!hasBeenNotifiedToday(from)) {
              markUserNotifiedToday(from);

              const nameGreeting = senderName ? ` ${senderName}` : "";
              const offMessage = `🌙 *JUSTBOT SEDANG OFF (DILUAR JAM OPERASIONAL / LIBUR)* 🌙
══════════════════════════════════════

Halo${nameGreeting}! Terima kasih telah menghubungi *JustBot AI*.

Saat ini bot sedang *OFF* pada zona waktu Anda (*${tzName}*).

📅 *Hari Aktif*: Sabtu - Kamis (Jumat Libur)
🕒 *Jam Aktif*: ${env.BOT_OPERATIONAL_START} - ${env.BOT_OPERATIONAL_END}

Silakan hubungi kami kembali pada waktu aktif tersebut. Terima kasih banyak atas pengertian Anda! 🙏✨`;

              await sendWhatsAppMessage(from, offMessage);
            } else {
              logger.info(
                { from },
                "User already received OFF notification today. Ignoring subsequent messages.",
              );
            }

            return reply
              .status(200)
              .send({ status: "offline", message: "Bot is offline" });
          }

          let userText = "";

          if (messageObj.type === "text") {
            userText = messageObj.text.body;
          } else if (
            messageObj.type === "interactive" &&
            messageObj.interactive?.button_reply
          ) {
            userText =
              messageObj.interactive.button_reply.id ||
              messageObj.interactive.button_reply.title;
          } else if (messageObj.type === "image") {
             const imageCaption = messageObj.image?.caption || "kiriman gambar";
             const botReply = await processIncomingMessage(
               from,
               imageCaption,
               senderName,
             );
             if (botReply !== "action:processed") {
               await sendWhatsAppMessage(from, botReply);
             }
             return reply.status(200).send({ status: "success" });
          }

          if (userText) {
          logger.info({ from, senderName, userText }, 'Processing user message / selection');

          const trimmed = userText.trim();
          const lower = trimmed.toLowerCase();
          const session = getUserSession(from);

          // Direct module activation command: shows Preview info screen with Start buttons first
          const directCmdMode = lower.startsWith('.') ? lower.replace('.', '') : '';
          if (directCmdMode && MODULE_DETAILS[directCmdMode]) {
            const detail = MODULE_DETAILS[directCmdMode];
            
            // Send Module Image Preview Banner first! (Highly reliable picsum source)
            const bannerUrl = MODULE_BANNERS[directCmdMode] || 'https://picsum.photos/800/600';
            const bannerCaption = `${detail.icon} *PREVIEW: ${detail.name.toUpperCase()}*`;
            await sendWhatsAppImage(from, bannerUrl, bannerCaption);

            // Send Info Details with Premium ASCII formatting
            const previewText = `╭────────────────────────────
│  ${detail.icon} *INFO MODUL: ${detail.name.toUpperCase()}*
╰────────────────────────────
${detail.desc}

✨ *Kemampuan Utama*:
${detail.capabilities.map((c) => ` ├─ ${c}`).join('\n')}
══════════════════════════════════════
Tekan tombol di bawah untuk memulai modul ini:`;

            // Customize preview buttons: CuanBuddy has its own standalone preview page now
            let startButtons = [
              { id: `action:start:${directCmdMode}`, title: '🚀 Start Mode' },
              { id: '.menu', title: '📋 Kembali Ke Menu' }
            ];

            await sendWhatsAppButtons(from, previewText, startButtons, `${detail.icon} PREVIEW: ${detail.name}`);
            return reply.status(200).send({ status: 'success' });
          }

          // 1. ACTION: User clicks "EXIT MODE"
          if (lower === 'action:exit' || lower === '.exit') {
              setUserActiveMode(from, null);

              const exitText = `🔴 *MODE DIMATIKAN*\n══════════════════════════════\nAnda telah keluar dari mode khusus. Silakan obrolkan apa saja atau ketik \`.menu\` untuk memilih modul baru.`;
              const exitButtons = [{ id: ".menu", title: "📋 Buka Menu" }];
              await sendWhatsAppButtons(
                from,
                exitText,
                exitButtons,
                "🤖 MODE OFF",
              );
              return reply.status(200).send({ status: "success" });
            }

            // 2. ACTION: User clicks "START MODE" (e.g. "action:start:coding")
            if (lower.startsWith("action:start:")) {
              const selectedMode = lower.replace("action:start:", "");
              
              // Special silent connection check validation for CuanBuddy start activation!
              if (selectedMode === "cuanbuddy") {
                const loadingMsg = `⏳ _Mohon tunggu sebentar, sedang memverifikasi koneksi WhatsApp Anda dengan akun CuanBuddy..._`;
                await sendWhatsAppMessage(from, loadingMsg);

                const verificationResult = await processCuanBuddyCheck(from, senderName);
                
                // If the verification string contains "WELCOME BACK", it means the account is successfully linked!
                if (verificationResult.includes("WELCOME BACK")) {
                  setUserActiveMode(from, "finance"); // Activate CuanBuddy transactional sync mode
                  
                  const linkedSuccessText = `🟢 *INTEGRASI CUANBUDDY AKTIF!* 🟢
══════════════════════════════════════
Status: Akun Anda terverifikasi dan tersambung!

Semua pesan berupa rincian transaksi pengeluaran/pemasukan yang Anda ketik di mode ini akan otomatis tercatat ke dashboard CuanBuddy Anda secara realtime.

👇 *Jika ingin keluar dari mode ini, klik tombol di bawah:*`;

                  const linkedButtons = [
                    { id: "action:exit", title: "🔴 Exit Mode" },
                    { id: ".menu", title: "📋 Buka Menu" },
                  ];
                  await sendWhatsAppButtons(from, linkedSuccessText, linkedButtons, "🟢 CUANBUDDY ACTIVE");
                } else {
                  // Not connected yet, reject mode entry and show setup instructions
                  const menuButtons = [
                    { id: ".menu", title: "📋 Buka Menu" },
                  ];
                  await sendWhatsAppButtons(
                    from,
                    verificationResult,
                    menuButtons,
                    "❌ KONEKSI GAGAL",
                  );
                }
                return reply.status(200).send({ status: "success" });
              }

              const detail = MODULE_DETAILS[selectedMode];

              if (detail) {
                setUserActiveMode(from, selectedMode);

                // Send Module Image Banner first!
                const bannerUrl =
                  MODULE_BANNERS[selectedMode] ||
                  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop";
                const bannerCaption = `${detail.icon} *WELCOME TO MODE: ${detail.name.toUpperCase()}*`;
                await sendWhatsAppImage(from, bannerUrl, bannerCaption);

                // Special onboarding layout for Finance module
                if (selectedMode === "finance") {
                  const introText = getFinanceIntroMessage(senderName);
                  const introButtons = [
                    { id: "action:cuanbuddy:check", title: "🔍 Check Status" },
                    { id: "action:exit", title: "🔴 Exit Mode" },
                  ];
                  await sendWhatsAppButtons(
                    from,
                    introText,
                    introButtons,
                    "💰 CUANBUDDY FINANCE",
                  );
                  return reply.status(200).send({ status: "success" });
                }

                // Send Mode Active Status Message with Exit Buttons
                const startedText = `🟢 *MODE ${detail.name.toUpperCase()} AKTIF!* 🟢
══════════════════════════════════════
${detail.icon} *Deskripsi*: ${detail.desc}

💡 *Status*: Sekarang Anda berada di mode khusus *${detail.name}*. Semua pertanyaan yang Anda kirim akan langsung dijawab oleh modul ini!

══════════════════════════════════════
👇 *Jika ingin keluar dari mode ini, klik tombol di bawah:*`;

                const exitButtons = [
                  { id: "action:exit", title: "🔴 Exit Mode" },
                  { id: ".menu", title: "📋 Buka Menu" },
                ];

                await sendWhatsAppButtons(
                  from,
                  startedText,
                  exitButtons,
                  "🚀 MODE STATUS",
                );
                return reply.status(200).send({ status: "success" });
              }
            }

            // Special action: Check CuanBuddy status and verify connection dynamically
            if (lower === "action:cuanbuddy:check") {
              const loadingMsg = `⏳ _Mohon tunggu sebentar, sedang memproses dan mengambil data Anda dari CuanBuddy App..._`;
              await sendWhatsAppMessage(from, loadingMsg);

              const resultMsg = await processCuanBuddyCheck(from, senderName);
              const menuButtons = [
                { id: "action:exit", title: "🔴 Exit Mode" },
                { id: ".menu", title: "📋 Buka Menu" },
              ];
              await sendWhatsAppButtons(
                from,
                resultMsg,
                menuButtons,
                "💳 CUANBUDDY STATUS",
              );
              return reply.status(200).send({ status: "success" });
            }

            // 3. ACTION: User selects module from LIST MENU (e.g. "select:module:coding")
            if (lower.startsWith('select:module:')) {
              const selectedMode = lower.replace('select:module:', '');
              const detail = MODULE_DETAILS[selectedMode];

              if (detail) {
                // Send Module Image Preview Banner first!
                const bannerUrl = MODULE_BANNERS[selectedMode] || 'https://picsum.photos/800/600';
                const bannerCaption = `${detail.icon} *PREVIEW: ${detail.name.toUpperCase()}*`;
                await sendWhatsAppImage(from, bannerUrl, bannerCaption);

                // Send Info Details with Premium ASCII formatting
                const previewText = `╭────────────────────────────
│  ${detail.icon} *INFO MODUL: ${detail.name.toUpperCase()}*
╰────────────────────────────
${detail.desc}

✨ *Kemampuan Utama*:
${detail.capabilities.map((c) => ` ├─ ${c}`).join('\n')}
══════════════════════════════════════
Tekan tombol di bawah untuk memulai modul ini:`;

                let startButtons = [
                  { id: `action:start:${selectedMode}`, title: '🚀 Start Mode' },
                  { id: '.menu', title: '📋 Kembali Ke Menu' }
                ];

                await sendWhatsAppButtons(from, previewText, startButtons, `${detail.icon} PREVIEW: ${detail.name}`);
                return reply.status(200).send({ status: 'success' });
              }
            }

            // 4. ACTION: User asks for .menu
            if (
              lower === ".menu" ||
              lower === "!menu" ||
              lower === "/help" ||
              lower === "help" ||
              lower === "menu"
            ) {
              const menuText = getHelpMenu(senderName, session.timezoneName);
              
              // Direct avatar image banner of the bot (highly reliable and lightweight)
              const botAvatarBanner = 'https://picsum.photos/800/600';
              
              // Send banner image first, and place the pure menu text as its caption
              await sendWhatsAppImage(from, botAvatarBanner, menuText);
              return reply.status(200).send({ status: "success" });
            }

            // 5. Intelligent Conversational AI Processing with Sender Profile Name!
            const botReply = await processIncomingMessage(
              from,
              userText,
              senderName,
            );

            if (botReply === "action:processed") {
              return reply.status(200).send({ status: "success" });
            }

            const lowerUserText = userText.toLowerCase();
            const isSpecialQuery =
              lowerUserText.includes("jujul") ||
              lowerUserText.includes("julia") ||
              lowerUserText.includes("irya") ||
              lowerUserText.includes("salsabillah");

            if (session.activeMode && !isSpecialQuery) {
              const detail = MODULE_DETAILS[session.activeMode];
              const modeButtons = [
                { id: "action:exit", title: "🔴 Exit Mode" },
              ];
              await sendWhatsAppButtons(
                from,
                botReply,
                modeButtons,
                `${detail?.icon || "🟢"} MODE: ${detail?.name || session.activeMode}`,
              );
            } else {
              // Direct natural conversational response!
              await sendWhatsAppMessage(from, botReply);
            }
          }
        }
      } catch (error) {
        logger.error(
          { error },
          "Error processing incoming WhatsApp webhook payload",
        );
      }

      return reply.status(200).send({ status: "success" });
    },
  );
}
