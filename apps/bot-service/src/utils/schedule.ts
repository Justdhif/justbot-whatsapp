import { env } from '../config/env.js';

export function isBotOnline(): boolean {
  if (!env.BOT_ENABLE_SCHEDULE) {
    return true; // Schedule disabled, bot is always online
  }

  // Get current date & time in Asia/Jakarta timezone (WIB)
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    weekday: 'short',
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(now);

  let hour = 0;
  let minute = 0;
  let dayName = '';

  for (const part of parts) {
    if (part.type === 'hour') hour = parseInt(part.value, 10);
    if (part.type === 'minute') minute = parseInt(part.value, 10);
    if (part.type === 'weekday') dayName = part.value;
  }

  // Day mapping: Sun=7, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
  const dayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };

  const currentDay = dayMap[dayName] || 1;
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
