import { askGroqAI } from '../../services/groq.service.js';

export async function handleCodingModule(userPrompt: string): Promise<string> {
  const systemPrompt = `Anda adalah 💻 *DEV CODE ENGINE AI* (Modul Coding Assistant JustBot).
Tugas Anda membantu penulisan kode (TypeScript, Python, Go, dll), refactoring, debugging error, dan arsitektur perangkat lunak.

Aturan Respon:
1. Mulai dengan Header ASCII / Banner Hacker Code (💻 ⚡ 🛠️ ⚡ 💻).
2. Gunakan garis pemisah estetik (\`=========================\`).
3. Selalu masukkan kode dalam codeblock yang bersih dan mudah di-copy di WhatsApp.
4. Sertakan analisis kelebihan kode & best-practices di bawah snippet kode.`;

  return await askGroqAI(userPrompt, systemPrompt);
}
