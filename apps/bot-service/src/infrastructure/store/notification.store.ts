
const notifiedUsers: Record<string, string> = {};

export function hasBeenNotifiedToday(userId: string): boolean {
  const todayStr = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta' });
  return notifiedUsers[userId] === todayStr;
}

export function markUserNotifiedToday(userId: string): void {
  const todayStr = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta' });
  notifiedUsers[userId] = todayStr;
}
