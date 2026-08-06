import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { env, setBotBaseUrl } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { processIncomingMessage, MODULE_DETAILS } from "../../core/use-cases/process-message.use-case.js";
import { handleWebhookActionOrMessage } from "../../controllers/action.controller.js";
import {
  sendWhatsAppMessage,
  sendWhatsAppButtons,
} from "../gateways/whatsapp.gateway.js";
import { getUserSession, setUserLastImage, clearUserLastImage } from "../store/session.store.js";
import { generateStickerFromWhatsAppMedia, sendWhatsAppSticker } from "../gateways/whatsapp.gateway.js";
import { isBotOnline, getBotOnlineStatus } from "../../utils/schedule.js";
import {
  hasBeenNotifiedToday,
  markUserNotifiedToday,
} from "../store/notification.store.js";
import { apiLogBotActivity } from "../gateways/api-client.gateway.js";

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
      const host = request.headers.host || '';
      const protocol = request.headers['x-forwarded-proto'] || 'https';
      const baseUrl = host ? `${protocol}://${host}` : '';
      if (baseUrl) {
        setBotBaseUrl(baseUrl);
      }

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
      const host = request.headers.host || '';
      const protocol = request.headers['x-forwarded-proto'] || 'https';
      const baseUrl = host ? `${protocol}://${host}` : '';
      if (baseUrl) {
        setBotBaseUrl(baseUrl);
      }

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

          const isWita = /^(628117|628118|628119|628139|628181|628182|628183|628191|628192|628193|628121|628141|628161|628171|628211|628221|628231|628241|628242|628243|628244|628245|628246|6281254|6281347|6282154|6285247|6285347|6281349|6285246|6282153|6281253|6285250|6285251|6285252|628138|628538|6283|6285)/.test(from);
          
          const isWit = /^(628114|628124|6281354|628219|628229|628529|628539|6289)/.test(from);

          if (isWit) {
            tzOffset = 9;
            tzName = "WIT (Asia/Jayapura)";
          } else if (isWita) {
            tzOffset = 8;
            tzName = "WITA (Asia/Makassar)";
          }

          session.timezoneOffset = tzOffset;
          session.timezoneName = tzName;

          const botStatus = await getBotOnlineStatus(session.timezoneOffset);

          if (!botStatus.isOnline) {
            logger.info(
              { from, senderName, tzName: session.timezoneName, isMaintenance: botStatus.isMaintenance },
              botStatus.isMaintenance
                ? "🔧 Bot is currently in MAINTENANCE mode."
                : "🌙 Bot is currently OFF / Outside Operational Hours.",
            );

            if (!hasBeenNotifiedToday(from)) {
              markUserNotifiedToday(from);

              const nameGreeting = senderName ? ` ${senderName}` : "";
              let offMessage = "";

              if (botStatus.isMaintenance) {
                offMessage = `🔧 *JUSTBOT SEDANG MAINTENANCE* 🔧
══════════════════════════════════════

Halo${nameGreeting}! Mohon maaf atas ketidaknyamanan ini.

Saat ini *JustBot AI* sedang dalam pemeliharaan sistem (maintenance) untuk peningkatan layanan.

Silakan hubungi kami kembali beberapa saat lagi. Terima kasih atas kesabaran Anda! 🙏✨`;
              } else {
                offMessage = `🌙 *JUSTBOT SEDANG OFF (DILUAR JAM OPERASIONAL / LIBUR)* 🌙
══════════════════════════════════════

Halo${nameGreeting}! Terima kasih telah menghubungi *JustBot AI*.

Saat ini bot sedang *OFF* pada zona waktu Anda (*${session.timezoneName}*).

📅 *Hari Aktif*: ${botStatus.effectiveDaysText}
🕒 *Jam Aktif*: ${botStatus.effectiveHourStart} - ${botStatus.effectiveHourEnd}

Silakan hubungi kami kembali pada waktu aktif tersebut. Terima kasih banyak atas pengertian Anda! 🙏✨`;
              }

              await sendWhatsAppMessage(from, offMessage);
            } else {
              logger.info(
                { from },
                "User already received OFF/Maintenance notification today. Ignoring subsequent messages.",
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
          } else if (
            messageObj.type === "interactive" &&
            messageObj.interactive?.list_reply
          ) {
            userText =
              messageObj.interactive.list_reply.id ||
              messageObj.interactive.list_reply.title;
          } else if (messageObj.type === "image") {
            const imageCaptionText = imageCaption.trim();
            const stickerRequest = /^\.sticker\b/i.test(imageCaptionText);

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

            const safeLogActivity = async (
              text: string,
              direction: 'incoming' | 'outgoing',
              moduleUsed?: string
            ) => {
              try {
                await apiLogBotActivity(from, senderName, {
                  senderNumber: from,
                  senderName: senderName || undefined,
                  messageText: text,
                  direction,
                  moduleUsed,
                  status: 'success',
                });
              } catch (err) {
                logger.warn({ err }, 'Failed to log bot activity');
              }
            };

            const iqcRequest = /^\.iqc$/i.test(imageCaptionText);
            if (iqcRequest) {
              const isIqcHandled = await handleWebhookActionOrMessage(from, imageCaptionText, senderName, session);
              if (isIqcHandled) {
                return reply.status(200).send({ status: "success" });
              }
            }

            // Log incoming image/caption
            await safeLogActivity(imageCaptionText || "kiriman gambar", 'incoming', session.activeMode || undefined);

            const botReply = await processIncomingMessage(
              from,
              imageCaptionText || "kiriman gambar",
              senderName,
            );
            if (botReply !== "action:processed") {
              await sendWhatsAppMessage(from, botReply);
              // Log outgoing reply
              await safeLogActivity(botReply, 'outgoing', session.activeMode || undefined);
            }
            return reply.status(200).send({ status: "success" });
          }

          if (userText) {
            const isActionHandled = await handleWebhookActionOrMessage(from, userText, senderName, session);
            if (isActionHandled) {
              return reply.status(200).send({ status: "success" });
            }

            const safeLogActivity = async (
              text: string,
              direction: 'incoming' | 'outgoing',
              moduleUsed?: string
            ) => {
              try {
                await apiLogBotActivity(from, senderName, {
                  senderNumber: from,
                  senderName: senderName || undefined,
                  messageText: text,
                  direction,
                  moduleUsed,
                  status: 'success',
                });
              } catch (err) {
                logger.warn({ err }, 'Failed to log bot activity');
              }
            };

            // Log incoming text
            await safeLogActivity(userText, 'incoming', session.activeMode || undefined);

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

            // Log outgoing reply
            await safeLogActivity(botReply, 'outgoing', session.activeMode || undefined);
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
