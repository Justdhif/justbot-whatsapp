import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const cuanBuddyApi = axios.create({
  baseURL: env.CUANBUDDY_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CuanBuddyUserProfile {
  id: string;
  userId: string;
  phoneNumber?: string;
  waConnectOtp?: string;
}

export interface CuanBuddyUser {
  id: string;
  email: string;
}

// 1. Verify 6-digit OTP code to pair WhatsApp Phone Number
export async function pairWhatsAppWithOtp(phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await cuanBuddyApi.post('/whatsapp/connect-otp/verify', {
      phoneNumber,
      otp,
    });
    return {
      success: response.data?.success || true,
      message: response.data?.message || 'Berhasil menghubungkan akun CuanBuddy!',
    };
  } catch (error: any) {
    logger.error({ error: error?.response?.data || error.message }, 'Failed to pair WhatsApp OTP with CuanBuddy API');
    return {
      success: false,
      message: error?.response?.data?.message || 'Kode OTP tidak valid atau sudah kadaluarsa.',
    };
  }
}

// 2. Fetch CuanBuddy user profile by WhatsApp Phone Number
export async function getCuanBuddyUserByPhone(phoneNumber: string): Promise<{ isConnected: boolean; user?: any }> {
  try {
    const response = await cuanBuddyApi.get(`/whatsapp/user-by-phone?phoneNumber=${phoneNumber}`);
    if (response.data && response.data.userId) {
      return { isConnected: true, user: response.data };
    }
    return { isConnected: false };
  } catch (error) {
    return { isConnected: false };
  }
}

// 3. Record transaction to CuanBuddy API
export async function recordTransactionToCuanBuddy(
  phoneNumber: string,
  data: { amount: number; type: 'INCOME' | 'EXPENSE'; categoryName: string; note: string }
): Promise<{ success: boolean; message: string; transaction?: any }> {
  try {
    const response = await cuanBuddyApi.post('/whatsapp/transactions', {
      phoneNumber,
      amount: data.amount,
      type: data.type,
      categoryName: data.categoryName,
      note: data.note,
    });

    return {
      success: true,
      message: 'Berhasil mencatat transaksi ke CuanBuddy!',
      transaction: response.data,
    };
  } catch (error: any) {
    logger.error({ error: error?.response?.data || error.message }, 'Failed to record transaction to CuanBuddy API');
    return {
      success: false,
      message: error?.response?.data?.message || 'Gagal mencatat transaksi ke CuanBuddy.',
    };
  }
}
