import { env } from '../config/env.js';

export function isBotOnline(): boolean {
  if (!env.BOT_ENABLE_SCHEDULE) {
    return true; // Schedule disabled, bot is always online
  }

  // Get current UTC date
  const now = new Date();

  // Convert UTC time explicitly to Asia/Jakarta (WIB = UTC + 7 hours)
  const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);

  const hour = wibTime.getUTCHours();
  const minute = wibTime.getUTCMinutes();
  const day = wibTime.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Convert JS day (0=Sun, 1=Mon, ..., 6=Sat) to Schedule day (1=Mon, 2=Tue, ..., 6=Sat, 7=Sun)
  const currentDay = day === 0 ? 7 : day;

  const allowedDays = env.BOT_OPERATIONAL_DAYS.split(',').map((d) => parseInt(d.trim(), 10));

  if (!allowedDays.includes(currentDay)) {
    return false; // Day is not in operational days
  }

  // Convert start & end hours to minutes from midnight
  const [startHour, startMin] = env.BOT_OPERATIONAL_START.split(':').map((v) => parseInt(v, 10));
  const [endHour, endMin] = env.BOT_OPERATIONAL_END.split(':').map((v) => parseInt(v, 10));

  const currentMinutes = hour * 60 + minute;
  const startMinutes = startHour * 60 + (startMin || 0);
  const endMinutes = endHour * 60 + (endMin || 0);

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Overnight operational hours (e.g., 22:00 to 06:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}
