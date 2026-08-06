import { env } from '../config/env.js';
import { apiGetBotConfiguration } from '../infrastructure/gateways/api-client.gateway.js';

export interface BotStatusResult {
  isOnline: boolean;
  isMaintenance: boolean;
  effectiveDaysText: string;
  effectiveHourStart: string;
  effectiveHourEnd: string;
}

export async function getBotOnlineStatus(offsetHours: number = 7): Promise<BotStatusResult> {
  let effectiveDays: number[] = [1, 2, 3, 4, 6, 7]; // Default fallback: Senin-Kamis, Sabtu-Minggu
  let effectiveHourStart = '07:00';
  let effectiveHourEnd = '21:00';
  let isMaintenance = false;
  let isScheduleEnabled = env.BOT_ENABLE_SCHEDULE;

  try {
    const config = await apiGetBotConfiguration();
    if (config) {
      effectiveDays = config.effectiveDays;
      effectiveHourStart = config.effectiveHourStart;
      effectiveHourEnd = config.effectiveHourEnd;
      isMaintenance = config.isMaintenance;
      isScheduleEnabled = true; 
    } else {
      if (env.BOT_OPERATIONAL_DAYS) {
        effectiveDays = env.BOT_OPERATIONAL_DAYS.split(',').map((d) => parseInt(d.trim(), 10));
      }
      effectiveHourStart = env.BOT_OPERATIONAL_START;
      effectiveHourEnd = env.BOT_OPERATIONAL_END;
    }
  } catch {
    if (env.BOT_OPERATIONAL_DAYS) {
      effectiveDays = env.BOT_OPERATIONAL_DAYS.split(',').map((d) => parseInt(d.trim(), 10));
    }
    effectiveHourStart = env.BOT_OPERATIONAL_START;
    effectiveHourEnd = env.BOT_OPERATIONAL_END;
  }

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  
  let effectiveDaysText = '';
  const sortedDays = [...effectiveDays].sort((a, b) => a - b);
  if (sortedDays.length === 7) {
    effectiveDaysText = 'Setiap Hari';
  } else if (JSON.stringify(sortedDays) === JSON.stringify([1, 2, 3, 4, 5])) {
    effectiveDaysText = 'Senin - Jumat (Sabtu & Minggu Libur)';
  } else if (JSON.stringify(sortedDays) === JSON.stringify([1, 2, 3, 4, 6, 7])) {
    effectiveDaysText = 'Sabtu - Kamis (Jumat Libur)';
  } else {
    effectiveDaysText = sortedDays.map(d => dayNames[d - 1]).filter(Boolean).join(', ');
  }

  if (isMaintenance) {
    return {
      isOnline: false,
      isMaintenance: true,
      effectiveDaysText,
      effectiveHourStart,
      effectiveHourEnd,
    };
  }

  if (!isScheduleEnabled) {
    return {
      isOnline: true,
      isMaintenance: false,
      effectiveDaysText,
      effectiveHourStart,
      effectiveHourEnd,
    };
  }

  const now = new Date();
  const shiftTime = new Date(now.getTime() + offsetHours * 60 * 60 * 1000);

  const hour = shiftTime.getUTCHours();
  const minute = shiftTime.getUTCMinutes();
  const day = shiftTime.getUTCDay();

  const currentDay = day === 0 ? 7 : day;

  if (!effectiveDays.includes(currentDay)) {
    return {
      isOnline: false,
      isMaintenance: false,
      effectiveDaysText,
      effectiveHourStart,
      effectiveHourEnd,
    };
  }

  const [startHour, startMin] = effectiveHourStart.split(':').map((v) => parseInt(v, 10));
  const [endHour, endMin] = effectiveHourEnd.split(':').map((v) => parseInt(v, 10));

  const currentMinutes = hour * 60 + minute;
  const startMinutes = startHour * 60 + (startMin || 0);
  const endMinutes = endHour * 60 + (endMin || 0);

  let isOnline = false;
  if (startMinutes <= endMinutes) {
    isOnline = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    isOnline = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  return {
    isOnline,
    isMaintenance: false,
    effectiveDaysText,
    effectiveHourStart,
    effectiveHourEnd,
  };
}

export async function isBotOnline(offsetHours: number = 7): Promise<boolean> {
  const result = await getBotOnlineStatus(offsetHours);
  return result.isOnline;
}
