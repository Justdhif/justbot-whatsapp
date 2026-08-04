export interface UserSession {
  activeMode: string | null; 
  timezoneOffset: number;    
  timezoneName: string;      
  updatedAt: number;
  lastImageMediaId?: string | null;
  lastImageMimeType?: string | null;
  lastImageCaption?: string | null;
  
  awaitingFinanceOtp?: boolean;   
  cuanbuddyPhone?: string | null; 
}

export interface ModuleDetail {
  name: string;
  icon: string;
  desc: string;
  capabilities: string[];
}
