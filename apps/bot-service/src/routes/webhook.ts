import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { processIncomingMessage, MODULE_DETAILS } from "../modules/router.js";
import axios from "axios";
import { getHelpMenu } from "../modules/utilities/utilities.handler.js";
import { generateBratSticker, generateBratVideoSticker } from "../services/brat.service.js";
import { generateStickerFromWhatsAppMedia } from "../services/whatsapp.service.js";
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
} from "../services/whatsapp.service.js";
import { getUserSession, setUserActiveMode, setUserLastImage, clearUserLastImage } from "../utils/session.js";
import { isBotOnline } from "../utils/schedule.js";
import {
  hasBeenNotifiedToday,
  markUserNotifiedToday,
} from "../utils/offNotificationStore.js";

// Module banners have been removed. Preview is conversational now except for CuanBuddy.

interface WebhookQuery {
  "hub.mode"?: string;
  "hub.verify_token"?: string;
  "hub.challenge"?: string;
}

export async function webhookRoutes(fastify: FastifyInstance) {
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

          const senderName = valueObj.contacts?.[0]?.profile?.name || "";

          const session = getUserSession(from);

          let tzOffset = 7;
          let tzName = "WIB (Asia/Jakarta)";

          const isWitaPrefix =
            /^(6281254|6281347|6282154|6285247|6285347|6281349|6285246|6282153|6281253|6285250|6285251|6285252|628138|628538)/.test(
              from,
            );
          if (isWitaPrefix) {
            tzOffset = 8;
            tzName = "WITA (Asia/Makassar)";
          }

          session.timezoneOffset = tzOffset;
          session.timezoneName = tzName;

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
          const imageMediaId = messageObj.image?.id || null;
          const imageMimeType = messageObj.image?.mime_type || null;
          const imageCaption = messageObj.image?.caption || "";

          if (messageObj.type === "image" && imageMediaId) {
            setUserLastImage(from, imageMediaId, imageMimeType, imageCaption);
          }

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
            const imageCaptionText = imageCaption.trim();
            const stickerRequest = /^(?:\.|\/)?(?:sticker|s)\b/i.test(imageCaptionText);

            if (stickerRequest) {
              if (!imageMediaId) {
                await sendWhatsAppMessage(
                  from,
                  "Saya tidak menemukan file gambar yang bisa diubah menjadi sticker.",
                );
                return reply.status(200).send({ status: "success" });
              }

              await sendWhatsAppMessage(from, "⏳ Sedang membuat sticker dari gambar...");
              const stickerBuffer = await generateStickerFromWhatsAppMedia(imageMediaId);

              if (!stickerBuffer) {
                await sendWhatsAppMessage(
                  from,
                  "Gagal membuat sticker dari gambar ini. Coba kirim ulang fotonya.",
                );
                return reply.status(200).send({ status: "success" });
              }

              const stickerSent = await sendWhatsAppSticker(from, stickerBuffer);

              if (!stickerSent) {
                await sendWhatsAppMessage(
                  from,
                  "Gagal mengirim sticker. Coba lagi beberapa saat.",
                );
              }

              clearUserLastImage(from);
              return reply.status(200).send({ status: "success" });
            }

            const botReply = await processIncomingMessage(
              from,
              imageCaptionText || "kiriman gambar",
              senderName,
            );
            if (botReply !== "action:processed") {
              await sendWhatsAppMessage(from, botReply);
            }
            return reply.status(200).send({ status: "success" });
          }

          if (userText) {
            logger.info(
              { from, senderName, userText },
              "Processing user message / selection",
            );

            const trimmed = userText.trim();
            const lower = trimmed.toLowerCase();
            const session = getUserSession(from);

            
            const directCmdMode = lower.startsWith(".")
              ? lower.replace(".", "")
              : "";
            if (
              directCmdMode === "cuanbuddy" &&
              MODULE_DETAILS[directCmdMode]
            ) {
              const detail = MODULE_DETAILS[directCmdMode];

              const bannerUrl = "https://picsum.photos/800/600";
              const bannerCaption = `${detail.icon} *PREVIEW: ${detail.name.toUpperCase()}*`;
              await sendWhatsAppImage(from, bannerUrl, bannerCaption);

              const previewText = `╭────────────────────────────
│  ${detail.icon} *INFO MODUL: ${detail.name.toUpperCase()}*
╰────────────────────────────
${detail.desc}

✨ *Kemampuan Utama*:
${detail.capabilities.map((c) => ` ├─ ${c}`).join("\n")}
══════════════════════════════════════
Tekan tombol di bawah untuk memulai modul ini:`;

              let startButtons = [
                { id: `action:start:${directCmdMode}`, title: "🚀 Start Mode" },
                { id: ".menu", title: "📋 Kembali Ke Menu" },
              ];

              await sendWhatsAppButtons(
                from,
                previewText,
                startButtons,
                `${detail.icon} PREVIEW: ${detail.name}`,
              );
              return reply.status(200).send({ status: "success" });
            }

            if (lower === "action:exit" || lower === ".exit") {
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

            if (lower.startsWith("action:start:")) {
              const selectedMode = lower.replace("action:start:", "");

              if (selectedMode === "cuanbuddy") {
                const loadingMsg = `⏳ _Mohon tunggu sebentar, sedang memverifikasi koneksi WhatsApp Anda dengan akun CuanBuddy..._`;
                await sendWhatsAppMessage(from, loadingMsg);

                const verificationResult = await processCuanBuddyCheck(
                  from,
                  senderName,
                );

                if (verificationResult.includes("WELCOME BACK")) {
                  setUserActiveMode(from, "finance");

                  const linkedSuccessText = `🟢 *INTEGRASI CUANBUDDY AKTIF!* 🟢
══════════════════════════════════════
Status: Akun Anda terverifikasi dan tersambung!

Semua pesan berupa rincian transaksi pengeluaran/pemasukan yang Anda ketik di mode ini akan otomatis tercatat ke dashboard CuanBuddy Anda secara realtime.

👇 *Jika ingin keluar dari mode ini, klik tombol di bawah:*`;

                  const linkedButtons = [
                    { id: "action:exit", title: "🔴 Exit Mode" },
                    { id: ".menu", title: "📋 Buka Menu" },
                  ];
                  await sendWhatsAppButtons(
                    from,
                    linkedSuccessText,
                    linkedButtons,
                    "🟢 CUANBUDDY ACTIVE",
                  );
                } else {
                  const menuButtons = [{ id: ".menu", title: "📋 Buka Menu" }];
                  await sendWhatsAppButtons(
                    from,
                    verificationResult,
                    menuButtons,
                    "❌ KONEKSI GAGAL",
                  );
                }
                return reply.status(200).send({ status: "success" });
              }
            }

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

            
            if (lower.startsWith("select:module:")) {
              const selectedMode = lower.replace("select:module:", "");

              if (selectedMode === "cuanbuddy") {
                const detail = MODULE_DETAILS[selectedMode];
                if (detail) {
                  const bannerUrl = "https://picsum.photos/800/600";
                  const bannerCaption = `${detail.icon} *PREVIEW: ${detail.name.toUpperCase()}*`;
                  await sendWhatsAppImage(from, bannerUrl, bannerCaption);

                  const previewText = `╭────────────────────────────
│  ${detail.icon} *INFO MODUL: ${detail.name.toUpperCase()}*
╰────────────────────────────
${detail.desc}

✨ *Kemampuan Utama*:
${detail.capabilities.map((c) => ` ├─ ${c}`).join("\n")}
══════════════════════════════════════
Tekan tombol di bawah untuk memulai modul ini:`;

                  let startButtons = [
                    {
                      id: `action:start:${selectedMode}`,
                      title: "🚀 Start Mode",
                    },
                    { id: ".menu", title: "📋 Kembali Ke Menu" },
                  ];

                  await sendWhatsAppButtons(
                    from,
                    previewText,
                    startButtons,
                    `${detail.icon} PREVIEW: ${detail.name}`,
                  );
                  return reply.status(200).send({ status: "success" });
                }
              }
            }

            if (
              lower === ".menu" ||
              lower === "!menu" ||
              lower === "/help" ||
              lower === "help" ||
              lower === "menu"
            ) {
              const menuText = getHelpMenu(senderName, session.timezoneName);

              const botAvatarBanner = "https://picsum.photos/800/600";

              await sendWhatsAppImage(from, botAvatarBanner, menuText);
              return reply.status(200).send({ status: "success" });
            }

            const bratVideoCommandMatch = trimmed.match(/^(?:\.|\/)?brat(?:\s+(?:v|vid|video|gif)|v|vid|video|gif)(?:\s*[:\s]\s*(.*))?$/i);
            if (bratVideoCommandMatch) {
              const bratText = (bratVideoCommandMatch[1] || '').trim();

              if (!bratText) {
                await sendWhatsAppMessage(
                  from,
                  'Ketik `.bratv teks kamu` untuk membuat sticker Brat animasi.',
                );
                return reply.status(200).send({ status: "success" });
              }

              await sendWhatsAppMessage(from, '⏳ Sedang membuat sticker Brat animasi...');

              const stickerBuffer = await generateBratVideoSticker(bratText);
              const stickerSent = await sendWhatsAppSticker(from, stickerBuffer);

              if (!stickerSent) {
                await sendWhatsAppMessage(
                  from,
                  'Gagal mengirim sticker Brat animasi. Coba lagi beberapa saat.',
                );
              }

              return reply.status(200).send({ status: "success" });
            }
            const stickerCommandMatch = trimmed.match(/^(?:\.|\/)?(?:sticker|s)\b(?:\s+(.*))?$/i);
            if (stickerCommandMatch) {
              const session = getUserSession(from);
              const lastImageMediaId = session.lastImageMediaId;
              const commandText = (stickerCommandMatch[1] || "").trim();

              if (commandText) {
                await sendWhatsAppMessage(from, "Kirim gambar lalu caption `.sticker` atau reply gambar dengan `.sticker` untuk membuat sticker.");
                return reply.status(200).send({ status: "success" });
              }

              if (!lastImageMediaId) {
                await sendWhatsAppMessage(
                  from,
                  "Saya belum menemukan gambar terakhir untuk diubah menjadi sticker. Kirim foto dulu lalu reply `.sticker`.",
                );
                return reply.status(200).send({ status: "success" });
              }

              await sendWhatsAppMessage(from, "⏳ Sedang membuat sticker dari gambar terakhir...");
              const stickerBuffer = await generateStickerFromWhatsAppMedia(lastImageMediaId);

              if (!stickerBuffer) {
                await sendWhatsAppMessage(
                  from,
                  "Gagal membuat sticker dari gambar terakhir. Coba kirim ulang fotonya.",
                );
                return reply.status(200).send({ status: "success" });
              }

              const stickerSent = await sendWhatsAppSticker(from, stickerBuffer);

              if (!stickerSent) {
                await sendWhatsAppMessage(
                  from,
                  "Gagal mengirim sticker. Coba lagi beberapa saat.",
                );
              }

              clearUserLastImage(from);
              return reply.status(200).send({ status: "success" });
            }

            const bratCommandMatch = trimmed.match(/^(?:\.|\/)?brat(?:\s*[:\s]\s*(.*))?$/i);
            if (bratCommandMatch) {
              const bratText = (bratCommandMatch[1] || '').trim();

              if (!bratText) {
                await sendWhatsAppMessage(
                  from,
                  'Ketik `.brat teks kamu` untuk membuat sticker Brat.',
                );
                return reply.status(200).send({ status: "success" });
              }

              await sendWhatsAppMessage(from, '⏳ Sedang membuat sticker Brat...');

              const stickerBuffer = await generateBratSticker(bratText);
              const stickerSent = await sendWhatsAppSticker(from, stickerBuffer);

              if (!stickerSent) {
                await sendWhatsAppMessage(
                  from,
                  'Gagal mengirim sticker Brat. Coba lagi beberapa saat.',
                );
              }

              return reply.status(200).send({ status: "success" });
            }

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
