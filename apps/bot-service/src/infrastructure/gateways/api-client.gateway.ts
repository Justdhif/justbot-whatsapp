import axios, { AxiosInstance, AxiosError } from 'axios';
import { createHash } from 'crypto';
import { env } from '../../config/env.js';
import { getUserSession, setUserTokens } from '../store/session.store.js';
import { logger } from '../../utils/logger.js';

let _client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  if (!_client) {
    _client = axios.create({
      baseURL: env.BACKEND_API_URL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return _client;
}

function generateBotPassword(phoneNumber: string): string {
  return createHash('sha256')
    .update(`${phoneNumber}:${env.BOT_SECRET}`)
    .digest('hex')
    .slice(0, 32) 
    + 'A1'; 
}

function phoneToEmail(phoneNumber: string): string {
  return `${phoneNumber}@justbot.app`;
}

async function loginUser(phoneNumber: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await getClient().post('/api/auth/login', {
      email: phoneToEmail(phoneNumber),
      password: generateBotPassword(phoneNumber),
    });
    return {
      accessToken: res.data?.data?.accessToken ?? res.data?.accessToken,
      refreshToken: res.data?.data?.refreshToken ?? res.data?.refreshToken,
    };
  } catch {
    return null;
  }
}

async function registerUser(phoneNumber: string, displayName?: string): Promise<boolean> {
  try {
    await getClient().post('/api/auth/register', {
      phoneNumber,
      email: phoneToEmail(phoneNumber),
      password: generateBotPassword(phoneNumber),
      displayName: displayName || `WA User ${phoneNumber}`,
    });
    return true;
  } catch (err: any) {
    
    if (err?.response?.status === 409) return true;
    logger.error({ err, phoneNumber }, '❌ [ApiClient] Failed to register user');
    return false;
  }
}

async function refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await getClient().post('/api/auth/refresh', { refreshToken });
    return {
      accessToken: res.data?.data?.accessToken ?? res.data?.accessToken,
      refreshToken: res.data?.data?.refreshToken ?? res.data?.refreshToken,
    };
  } catch {
    return null;
  }
}

export async function checkAccountExists(phoneNumber: string): Promise<boolean> {
  const result = await loginUser(phoneNumber);
  return result !== null;
}

export async function registerUserWithName(
  phoneNumber: string,
  displayName: string,
): Promise<boolean> {
  return registerUser(phoneNumber, displayName);
}

export async function resolveAccessToken(
  phoneNumber: string,
  displayName?: string,
): Promise<string | null> {
  const session = getUserSession(phoneNumber);

  if (session.accessToken) return session.accessToken;

  if (session.refreshToken) {
    const tokens = await refreshTokens(session.refreshToken);
    if (tokens) {
      setUserTokens(phoneNumber, tokens.accessToken, tokens.refreshToken);
      return tokens.accessToken;
    }
  }

  const loginResult = await loginUser(phoneNumber);
  if (loginResult) {
    setUserTokens(phoneNumber, loginResult.accessToken, loginResult.refreshToken);
    return loginResult.accessToken;
  }

  return null;
}

async function authRequest<T>(
  phoneNumber: string,
  displayName: string | undefined,
  requester: (token: string) => Promise<T>,
): Promise<T> {
  let token = await resolveAccessToken(phoneNumber, displayName);
  if (!token) throw new Error('Tidak bisa mendapatkan akses ke backend. Coba lagi nanti.');

  try {
    return await requester(token);
  } catch (err: any) {
    
    if (err?.response?.status === 401) {
      setUserTokens(phoneNumber, null, getUserSession(phoneNumber).refreshToken ?? null);
      token = await resolveAccessToken(phoneNumber, displayName);
      if (!token) throw new Error('Sesi kamu sudah habis. Coba lagi.');
      return await requester(token);
    }
    throw err;
  }
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  createdAt: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  period?: { from: string; to: string };
}

export async function apiGetTransactions(
  phoneNumber: string,
  displayName?: string,
  filters?: { type?: string; limit?: number },
): Promise<Transaction[]> {
  return authRequest(phoneNumber, displayName, async (token) => {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    params.set('limit', String(filters?.limit ?? 10));
    const res = await getClient().get(`/api/finance/transactions?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data?.data ?? res.data?.data ?? [];
  });
}

export async function apiCreateTransaction(
  phoneNumber: string,
  displayName: string | undefined,
  payload: { type: 'income' | 'expense'; amount: number; category: string; description?: string; date?: string },
): Promise<Transaction> {
  return authRequest(phoneNumber, displayName, async (token) => {
    const res = await getClient().post('/api/finance/transactions', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data ?? res.data;
  });
}

export async function apiUpdateTransaction(
  phoneNumber: string,
  displayName: string | undefined,
  transactionId: string,
  payload: { type?: 'income' | 'expense'; amount?: number; category?: string; description?: string },
): Promise<Transaction> {
  return authRequest(phoneNumber, displayName, async (token) => {
    const res = await getClient().patch(`/api/finance/transactions/${transactionId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data ?? res.data;
  });
}

export async function apiDeleteTransaction(
  phoneNumber: string,
  displayName: string | undefined,
  transactionId: string,
): Promise<boolean> {
  return authRequest(phoneNumber, displayName, async (token) => {
    await getClient().delete(`/api/finance/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  });
}

export async function apiGetFinanceSummary(
  phoneNumber: string,
  displayName?: string,
): Promise<FinanceSummary> {
  return authRequest(phoneNumber, displayName, async (token) => {
    const res = await getClient().get('/api/finance/summary', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data ?? res.data;
  });
}

export async function apiApproveQrSession(
  sessionId: string,
  phoneNumber: string,
): Promise<boolean> {
  try {
    await getClient().post(
      '/api/auth/qr/approve',
      { sessionId, phoneNumber },
      {
        headers: {
          'x-bot-token': env.BOT_SECRET,
        },
      },
    );
    return true;
  } catch (err: any) {
    const msg = err?.response?.data?.error?.message ?? err?.response?.data?.message ?? err?.message;
    logger.error({ err, sessionId, phoneNumber }, `❌ [ApiClient] Failed to approve QR session: ${msg}`);
    throw new Error(msg || 'Gagal menyetujui QR Code');
  }
}

export interface Reminder {
  id: string;
  title: string;
  body?: string;
  remindAt: string;
  recurrence?: string;
  isActive: boolean;
  createdAt: string;
}

export async function apiGetReminders(
  phoneNumber: string,
  displayName?: string,
): Promise<Reminder[]> {
  return authRequest(phoneNumber, displayName, async (token) => {
    const res = await getClient().get('/api/reminders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data ?? res.data ?? [];
  });
}

export async function apiCreateReminder(
  phoneNumber: string,
  displayName: string | undefined,
  payload: { title: string; body?: string; remindAt: string; recurrence?: string },
): Promise<Reminder> {
  return authRequest(phoneNumber, displayName, async (token) => {
    const res = await getClient().post('/api/reminders', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data ?? res.data;
  });
}

export async function apiUpdateReminder(
  phoneNumber: string,
  displayName: string | undefined,
  reminderId: string,
  payload: { title?: string; body?: string; remindAt?: string; recurrence?: string; isActive?: boolean },
): Promise<Reminder> {
  return authRequest(phoneNumber, displayName, async (token) => {
    const res = await getClient().patch(`/api/reminders/${reminderId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data ?? res.data;
  });
}

export async function apiDeleteReminder(
  phoneNumber: string,
  displayName: string | undefined,
  reminderId: string,
): Promise<boolean> {
  return authRequest(phoneNumber, displayName, async (token) => {
    await getClient().delete(`/api/reminders/${reminderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  });
}

export async function apiLogBotActivity(
  phoneNumber: string,
  displayName: string | undefined,
  payload: {
    senderNumber: string;
    senderName?: string;
    messageText: string;
    direction: 'incoming' | 'outgoing';
    moduleUsed?: string;
    status?: 'success' | 'failed' | 'ignored';
  },
): Promise<boolean> {
  return authRequest(phoneNumber, displayName, async (token) => {
    await getClient().post('/api/analytics/logs', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  }).catch((err) => {
    logger.error({ err, phoneNumber }, '❌ [ApiClient] Failed to log bot activity');
    return false;
  });
}

export interface BotConfiguration {
  id: string;
  effectiveDays: number[];
  effectiveHourStart: string;
  effectiveHourEnd: string;
  isMaintenance: boolean;
  timezone: string;
  customWelcomeMessage: string | null;
}

export async function apiGetBotConfiguration(): Promise<BotConfiguration | null> {
  try {
    const res = await getClient().get('/api/bot-configurations');
    return res.data?.data ?? res.data;
  } catch (err: any) {
    logger.error({ err }, '❌ [ApiClient] Failed to fetch bot configuration');
    return null;
  }
}


