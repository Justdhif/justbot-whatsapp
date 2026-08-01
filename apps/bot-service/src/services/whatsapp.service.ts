import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const WA_API_URL = `https://graph.facebook.com/v20.0/${env.WA_PHONE_NUMBER_ID}/messages`;
const WA_MEDIA_URL = `https://graph.facebook.com/v20.0/${env.WA_PHONE_NUMBER_ID}/media`;

export async function uploadWhatsAppMedia(mediaBuffer: Buffer, mimeType: string): Promise<string | null> {
  try {
    const formData = new (globalThis as any).FormData();
    const blob = new (globalThis as any).Blob([mediaBuffer], { type: mimeType });

    formData.append('messaging_product', 'whatsapp');
    formData.append('file', blob, mimeType === 'image/webp' ? 'sticker.webp' : 'media.bin');

    const response = await (globalThis as any).fetch(WA_MEDIA_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.WA_CLOUD_API_ACCESS_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error({ status: response.status, errorText }, 'Failed to upload WhatsApp media');
      return null;
    }

    const data = await response.json() as { id?: string };
    return data.id || null;
  } catch (error: any) {
    logger.error(
      {
        errorResponse: error?.response?.data || error.message,
      },
      'Failed to upload WhatsApp media',
    );
    return null;
  }
}

export async function sendWhatsAppSticker(
  to: string,
  sticker: string,
  isMediaId = true,
): Promise<boolean> {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'sticker',
      sticker: isMediaId ? { id: sticker } : { link: sticker },
    };

    const response = await axios.post(WA_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${env.WA_CLOUD_API_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    logger.info({ to, responseId: response.data?.messages?.[0]?.id }, 'Sticker sent successfully to WhatsApp');
    return true;
  } catch (error: any) {
    logger.error(
      {
        to,
        errorResponse: error?.response?.data || error.message,
      },
      'Failed to send WhatsApp sticker message',
    );
    return false;
  }
}


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


export async function sendWhatsAppImage(to: string, imageUrl: string, captionText: string): Promise<boolean> {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'image',
      image: {
        link: imageUrl,
        caption: captionText,
      },
    };

    const response = await axios.post(WA_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${env.WA_CLOUD_API_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    logger.info({ to, responseId: response.data?.messages?.[0]?.id }, 'Image message sent successfully to WhatsApp');
    return true;
  } catch (error: any) {
    logger.error(
      {
        to,
        errorResponse: error?.response?.data || error.message,
      },
      'Failed to send WhatsApp image message'
    );
    return false;
  }
}


export async function sendWhatsAppButtons(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[],
  headerText?: string
): Promise<boolean> {
  try {
    const actionButtons = buttons.map((b) => ({
      type: 'reply',
      reply: {
        id: b.id,
        title: b.title.slice(0, 20),
      },
    }));

    const interactivePayload: any = {
      type: 'button',
      body: {
        text: bodyText,
      },
      action: {
        buttons: actionButtons,
      },
    };

    if (headerText) {
      interactivePayload.header = {
        type: 'text',
        text: headerText,
      };
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'interactive',
      interactive: interactivePayload,
    };

    const response = await axios.post(WA_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${env.WA_CLOUD_API_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    logger.info({ to, responseId: response.data?.messages?.[0]?.id }, 'Interactive buttons sent successfully to WhatsApp');
    return true;
  } catch (error: any) {
    logger.error(
      {
        to,
        errorResponse: error?.response?.data || error.message,
      },
      'Failed to send WhatsApp interactive buttons'
    );
    return false;
  }
}


export async function sendWhatsAppInteractiveList(
  to: string,
  bodyText: string,
  buttonTitle: string,
  sections: { title: string; rows: { id: string; title: string; description?: string }[] }[],
  headerText?: string
): Promise<boolean> {
  try {
    const interactivePayload: any = {
      type: 'list',
      body: {
        text: bodyText,
      },
      action: {
        button: buttonTitle.slice(0, 20),
        sections: sections,
      },
    };

    if (headerText) {
      interactivePayload.header = {
        type: 'text',
        text: headerText,
      };
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'interactive',
      interactive: interactivePayload,
    };

    const response = await axios.post(WA_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${env.WA_CLOUD_API_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    logger.info({ to, responseId: response.data?.messages?.[0]?.id }, 'Interactive list message sent successfully to WhatsApp');
    return true;
  } catch (error: any) {
    logger.error(
      {
        to,
        errorResponse: error?.response?.data || error.message,
      },
      'Failed to send WhatsApp interactive list message'
    );
    return false;
  }
}


