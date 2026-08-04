import { askGroqAI } from '../../infrastructure/gateways/groq.gateway.js';
import { logger } from '../../utils/logger.js';
import {
  apiGetTransactions,
  apiGetReminders,
} from '../../infrastructure/gateways/api-client.gateway.js';

export type TargetModule = 'finance' | 'reminder' | 'ambiguous';

export async function classifyTargetModule(
  from: string,
  senderName: string,
  text: string,
): Promise<TargetModule> {
  const lower = text.toLowerCase();

  const financeKeywords = [
    'transaksi', 'catat', 'jajan', 'pengeluaran', 'pemasukan',
    'belanja', 'gaji', 'uang', 'rupiah', 'rp', 'ribu', 'rb',
    'beli', 'bayar', 'makan', 'minum', 'sarapan', 'bensin', 'laporan', 'riwayat'
  ];
  const reminderKeywords = [
    'reminder', 'pengingat', 'ingat', 'ingatkan', 'jadwal',
    'alarm', 'janji', 'meeting', 'rapat', 'bangun', 'tidur',
    'minum obat', 'ingatin', 'ingatlah'
  ];

  let finCount = 0;
  let remCount = 0;
  financeKeywords.forEach(k => { if (lower.includes(k)) finCount++; });
  reminderKeywords.forEach(k => { if (lower.includes(k)) remCount++; });

  if (finCount > 0 && remCount === 0) return 'finance';
  if (remCount > 0 && finCount === 0) return 'reminder';

  const matchesId = text.trim().match(/^[0-9a-fA-F]{3,8}$/);
  if (matchesId) {
    const idPrefix = matchesId[0].toLowerCase();
    try {
      const txs = await apiGetTransactions(from, senderName, { limit: 20 });
      if (txs.some(tx => tx.id.startsWith(idPrefix))) return 'finance';
    } catch {}

    try {
      const reminders = await apiGetReminders(from, senderName);
      if (reminders.some(r => r.id.startsWith(idPrefix))) return 'reminder';
    } catch {}
  }

  const systemPrompt =
    `Kamu adalah asisten klasifikasi teks. Tentukan apakah permintaan edit/hapus dari user berikut ditujukan untuk:\n` +
    `- 'finance' (transaksi keuangan, belanja, uang, jajan, gaji, pemasukan, pengeluaran, dll)\n` +
    `- 'reminder' (pengingat, alarm, jadwal, janji, ingatkan, dll)\n\n` +
    `Jawab HANYA dengan kata "finance" atau "reminder". Jika tidak yakin atau sangat ambigu, jawab "ambiguous".`;

  try {
    const raw = await askGroqAI(text, systemPrompt);
    const cleaned = raw.trim().toLowerCase();
    if (cleaned.includes('finance')) return 'finance';
    if (cleaned.includes('reminder')) return 'reminder';
    return 'ambiguous';
  } catch (err) {
    logger.error({ err }, '❌ [General] Classifier failed, fallback to finance');
    return 'finance';
  }
}
