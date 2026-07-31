import { env } from '../config/env.js';

export function isBotOnline(): boolean {
  if (!env.BOT_ENABLE_SCHEDULE) {
    return true; // Schedule disabled, bot is always online
  }

  // Get current date & time explicitly formatted in Asia/Jakarta (WIB / UTC+7)
  const now = new Date();
  
  // Create Intl.DateTimeFormat for Asia/Jakarta timezone
  const jakartaTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
  const jakartaDate = new Date(jakartaTimeStr);

  const hour = jakartaDate.getHours();
  const minute = jakartaDate.getMinutes();
  const day = jakartaDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

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
