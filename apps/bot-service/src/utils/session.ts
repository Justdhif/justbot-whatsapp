// In-Memory User Session Storage for Active Bot Modes
export interface UserSession {
  activeMode: string | null; // e.g. 'coding', 'finance', 'creator', etc.
  updatedAt: number;
}

const userSessions: Record<string, UserSession> = {};

export function getUserSession(userId: string): UserSession {
  if (!userSessions[userId]) {
    userSessions[userId] = { activeMode: null, updatedAt: Date.now() };
  }
  return userSessions[userId];
}

export function setUserActiveMode(userId: string, mode: string | null): void {
  const session = getUserSession(userId);
  session.activeMode = mode;
  session.updatedAt = Date.now();
}
