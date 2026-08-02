import axios from 'axios';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import sharp from 'sharp';

const WA_API_URL = `https://graph.facebook.com/v20.0/${env.WA_PHONE_NUMBER_ID}/messages`;
const WA_MEDIA_URL = `https://graph.facebook.com/v20.0/${env.WA_PHONE_NUMBER_ID}/media`;
const WA_GRAPH_BASE_URL = 'https://graph.facebook.com/v20.0';

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

export async function sendWhatsAppImageFromBuffer(to: string, buffer: Buffer, captionText?: string): Promise<boolean> {
  try {
    const mediaId = await uploadWhatsAppMedia(buffer, 'image/jpeg', 'chat-mockup.jpg');
    if (!mediaId) {
      return false;
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'image',
      image: {
        id: mediaId,
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

    logger.info({ to, responseId: response.data?.messages?.[0]?.id }, 'Image buffer message sent successfully to WhatsApp');
    return true;
  } catch (error: any) {
    logger.error(
      {
        to,
        errorResponse: error?.response?.data || error.message,
      },
      'Failed to send WhatsApp image from buffer'
    );
    return false;
  }
}


async function uploadWhatsAppMedia(buffer: Buffer, mimeType: string, fileName: string): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('file', new Blob([buffer], { type: mimeType }), fileName);

    const response = await axios.post(WA_MEDIA_URL, formData, {
      headers: {
        Authorization: `Bearer ${env.WA_CLOUD_API_ACCESS_TOKEN}`,
      },
      timeout: 15000,
    });

    const mediaId = response.data?.id;

    if (!mediaId) {
      throw new Error('WhatsApp media upload returned no media id');
    }

    return mediaId;
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

export async function downloadWhatsAppMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    const mediaResponse = await axios.get(`${WA_GRAPH_BASE_URL}/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${env.WA_CLOUD_API_ACCESS_TOKEN}`,
      },
      params: {
        phone_number_id: env.WA_PHONE_NUMBER_ID,
      },
      timeout: 10000,
    });

    const mediaUrl = mediaResponse.data?.url;
    const mimeType = mediaResponse.data?.mime_type || 'image/jpeg';

    if (!mediaUrl) {
      throw new Error('WhatsApp media lookup returned no URL');
    }

    const fileResponse = await axios.get(mediaUrl, {
      headers: {
        Authorization: `Bearer ${env.WA_CLOUD_API_ACCESS_TOKEN}`,
      },
      responseType: 'arraybuffer',
      timeout: 15000,
    });

    return {
      buffer: Buffer.from(fileResponse.data),
      mimeType,
    };
  } catch (error: any) {
    logger.error(
      {
        mediaId,
        errorResponse: error?.response?.data || error.message,
      },
      'Failed to download WhatsApp media',
    );

    return null;
  }
}

export async function generateStickerBufferFromImage(imageBuffer: Buffer): Promise<Buffer> {
  return await sharp(imageBuffer)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 90 })
    .toBuffer();
}

export async function generateStickerFromWhatsAppMedia(mediaId: string): Promise<Buffer | null> {
  const media = await downloadWhatsAppMedia(mediaId);

  if (!media) {
    return null;
  }

  try {
    return await generateStickerBufferFromImage(media.buffer);
  } catch (error: any) {
    logger.error(
      {
        mediaId,
        mimeType: media.mimeType,
        errorMessage: error?.message,
      },
      'Failed to convert WhatsApp media into sticker',
    );

    return null;
  }
}


export async function sendWhatsAppSticker(to: string, stickerBuffer: Buffer): Promise<boolean> {
  try {
    const mediaId = await uploadWhatsAppMedia(stickerBuffer, 'image/webp', 'brat-sticker.webp');

    if (!mediaId) {
      return false;
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'sticker',
      sticker: {
        id: mediaId,
      },
    };

    const response = await axios.post(WA_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${env.WA_CLOUD_API_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    logger.info({ to, responseId: response.data?.messages?.[0]?.id }, 'Sticker message sent successfully to WhatsApp');
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


