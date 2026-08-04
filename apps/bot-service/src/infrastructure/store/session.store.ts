
import { UserSession } from '../../core/domain/session.js';

const userSessions: Record<string, UserSession> = {};

export function getUserSession(userId: string): UserSession {
  if (!userSessions[userId]) {
    userSessions[userId] = { 
      activeMode: null, 
      timezoneOffset: 7, 
      timezoneName: 'WIB (Asia/Jakarta)', 
      updatedAt: Date.now(),
      lastImageMediaId: null,
      lastImageMimeType: null,
      lastImageCaption: null,
      awaitingFinanceOtp: false,
      cuanbuddyPhone: null,
    };
  }
  return userSessions[userId];
}

export function setUserActiveMode(userId: string, mode: string | null): void {
  const session = getUserSession(userId);
  session.activeMode = mode;
  session.updatedAt = Date.now();
}



export function setUserLastImage(
  userId: string,
  mediaId: string | null,
  mimeType?: string | null,
  caption?: string | null,
): void {
  const session = getUserSession(userId);
  session.lastImageMediaId = mediaId;
  session.lastImageMimeType = mimeType ?? null;
  session.lastImageCaption = caption ?? null;
  session.updatedAt = Date.now();
}

export function clearUserLastImage(userId: string): void {
  const session = getUserSession(userId);
  session.lastImageMediaId = null;
  session.lastImageMimeType = null;
  session.lastImageCaption = null;
  session.updatedAt = Date.now();
}



export function setFinanceOtpPending(userId: string, pending: boolean): void {
  const session = getUserSession(userId);
  session.awaitingFinanceOtp = pending;
  session.updatedAt = Date.now();
}

export function setCuanbuddyPhone(userId: string, phone: string | null): void {
  const session = getUserSession(userId);
  session.cuanbuddyPhone = phone;
  session.awaitingFinanceOtp = false;
  session.updatedAt = Date.now();
}

export function getCuanbuddyPhone(userId: string): string | null {
  return getUserSession(userId).cuanbuddyPhone ?? null;
}
