import axios from 'axios';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const BASE_URL = env.CUANBUDDY_API_BASE_URL;


export async function cuanbuddyConnectOtp(
  phoneNumber: string,
  otp: string
): Promise<{ success: boolean; message: string; email?: string }> {
  try {
    const res = await axios.post(
      `${BASE_URL}/whatsapp/connect`,
      { phoneNumber, otp },
      { timeout: 10000 }
    );
    return res.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || 'Gagal menghubungi server CuanBuddy.';
    logger.error({ error: error?.response?.data || error.message }, 'cuanbuddyConnectOtp failed');
    return { success: false, message };
  }
}


export async function cuanbuddyGetTransactions(
  phoneNumber: string,
  limit = 10
): Promise<any[] | null> {
  try {
    const res = await axios.get(`${BASE_URL}/transactions`, {
      headers: {
        'x-wa-phone-number': phoneNumber,
      },
      params: { limit },
      timeout: 10000,
    });
    
    return res.data?.data ?? res.data ?? [];
  } catch (error: any) {
    logger.error(
      { error: error?.response?.data || error.message },
      'cuanbuddyGetTransactions failed'
    );
    return null;
  }
}
