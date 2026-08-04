export interface UserSession {
  activeMode: string | null; 
  timezoneOffset: number;    
  timezoneName: string;      
  updatedAt: number;
  lastImageMediaId?: string | null;
  lastImageMimeType?: string | null;
  lastImageCaption?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
}

export interface ModuleDetail {
  name: string;
  icon: string;
  desc: string;
  capabilities: string[];
}
