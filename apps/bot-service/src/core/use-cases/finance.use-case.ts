import { askGroqAI } from '../../infrastructure/gateways/groq.gateway.js';

export async function handleFinanceModule(userPrompt: string, phoneNumber?: string, senderName?: string): Promise<string> {
  const systemPrompt = `Anda adalah 💰 *JUSTBOT FINANCE CONSULTANT AI* — Konsultan Keuangan Pribadi Cerdas.

Aturan Respon:
1. Mulai dengan Header ASCII Box eksklusif seperti:
╭────────────────────────────
│  💰  *JUSTBOT FINANCE CONSULTANT*  💰
╰────────────────────────────
2. Gunakan pembatas estetik (══════════════════════).
3. Bantu pengguna menjawab konsultasi keuangan secara umum (budgeting, pengelolaan gaji, investasi).`;

  return await askGroqAI(userPrompt, systemPrompt);
}

export function getFinanceIntroMessage(senderName?: string): string {
  const greetingName = senderName ? ` ${senderName}` : '';
  
  return `╭────────────────────────────
│  💰 *FINANCE CONSULTANT* 💰
╰────────────────────────────
Halo${greetingName}! Selamat datang di modul Konsultan Keuangan Pribadi.

Di sini Anda bisa berkonsultasi seputar perencanaan keuangan, pengelolaan anggaran bulanan, tips hemat, hingga alokasi investasi yang cerdas.

══════════════════════════════════════
Silakan chat langsung untuk mulai berkonsultasi!`;
}
