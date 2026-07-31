// In-Memory User Session Storage for Active Bot Modes
export interface UserSession {
  activeMode: string | null; // e.g. 'coding', 'finance', 'creator', etc.
  timezoneOffset: number;    // UTC offset in hours, defaults to 7 (WIB / Asia/Jakarta)
  timezoneName: string;      // Readable name, e.g. 'Asia/Jakarta (WIB)'
  updatedAt: number;
}

const userSessions: Record<string, UserSession> = {};

export function getUserSession(userId: string): UserSession {
  if (!userSessions[userId]) {
    userSessions[userId] = { 
      activeMode: null, 
      timezoneOffset: 7, 
      timezoneName: 'WIB (Asia/Jakarta)', 
      updatedAt: Date.now() 
    };
  }
  return userSessions[userId];
}

export function setUserActiveMode(userId: string, mode: string | null): void {
  const session = getUserSession(userId);
  session.activeMode = mode;
  session.updatedAt = Date.now();
}

export function setUserTimezone(userId: string, offset: number, name: string): void {
  const session = getUserSession(userId);
  session.timezoneOffset = offset;
  session.timezoneName = name;
  session.updatedAt = Date.now();
}
