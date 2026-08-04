import { env } from '../config/env.js';

export function isBotOnline(offsetHours: number = 7): boolean {
  if (!env.BOT_ENABLE_SCHEDULE) {
    return true; 
  }

  const now = new Date();

  const shiftTime = new Date(now.getTime() + offsetHours * 60 * 60 * 1000);

  const hour = shiftTime.getUTCHours();
  const minute = shiftTime.getUTCMinutes();
  const day = shiftTime.getUTCDay(); 

  const currentDay = day === 0 ? 7 : day;

  const allowedDays = env.BOT_OPERATIONAL_DAYS.split(',').map((d) => parseInt(d.trim(), 10));

  if (!allowedDays.includes(currentDay)) {
    return false; 
  }

  const [startHour, startMin] = env.BOT_OPERATIONAL_START.split(':').map((v) => parseInt(v, 10));
  const [endHour, endMin] = env.BOT_OPERATIONAL_END.split(':').map((v) => parseInt(v, 10));

  const currentMinutes = hour * 60 + minute;
  const startMinutes = startHour * 60 + (startMin || 0);
  const endMinutes = endHour * 60 + (endMin || 0);

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}
