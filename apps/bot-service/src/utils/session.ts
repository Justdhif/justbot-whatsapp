
export interface UserSession {
  activeMode: string | null; 
  timezoneOffset: number;    
  timezoneName: string;      
  updatedAt: number;
  lastImageMediaId?: string | null;
  lastImageMimeType?: string | null;
  lastImageCaption?: string | null;
}

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
