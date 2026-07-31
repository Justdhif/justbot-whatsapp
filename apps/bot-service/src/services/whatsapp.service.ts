import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const WA_API_URL = `https://graph.facebook.com/v20.0/${env.WA_PHONE_NUMBER_ID}/messages`;

// Send plain text message
export async function sendWhatsAppMessage(to: string, messageText: string): Promise<boolean> {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: {
        preview_url: false,
        body: messageText,
      },
    };

    const response = await axios.post(WA_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${env.WA_CLOUD_API_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    logger.info({ to, responseId: response.data?.messages?.[0]?.id }, 'Message sent successfully to WhatsApp');
    return true;
  } catch (error: any) {
    logger.error(
      {
        to,
        errorResponse: error?.response?.data || error.message,
      },
      'Failed to send WhatsApp message'
    );
    return false;
  }
}

// Send Image Message with Caption & Quick Reply Buttons (Max 3 Buttons)
export async function sendWhatsAppImageWithButtons(
  to: string,
  imageUrl: string,
  captionText: string,
  buttons: { id: string; title: string }[]
): Promise<boolean> {
  try {
    const actionButtons = buttons.map((b) => ({
      type: 'reply',
      reply: {
        id: b.id,
        title: b.title.slice(0, 20),
      },
    }));

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'interactive',
      interactive: {
        type: 'button',
        header: {
          type: 'image',
          image: {
            link: imageUrl,
          },
        },
        body: {
          text: captionText,
        },
        action: {
          buttons: actionButtons,
        },
      },
    };

    const response = await axios.post(WA_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${env.WA_CLOUD_API_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    logger.info({ to, responseId: response.data?.messages?.[0]?.id }, 'Interactive image + buttons sent successfully to WhatsApp');
    return true;
  } catch (error: any) {
    logger.error(
      {
        to,
        errorResponse: error?.response?.data || error.message,
      },
      'Failed to send WhatsApp interactive image + buttons'
    );
    return false;
  }
}
