import {
  sendWhatsAppMessage,
  sendWhatsAppButtons,
} from "../../infrastructure/gateways/whatsapp.gateway.js";
import {
  getUserSession,
  setUserActiveMode,
  setPendingAction,
} from "../../infrastructure/store/session.store.js";
import {
  resolveAccessToken,
  apiGetTransactions,
  apiCreateTransaction,
  apiUpdateTransaction,
  apiDeleteTransaction,
  apiGetFinanceSummary,
  Transaction,
} from "../../infrastructure/gateways/api-client.gateway.js";
import { askGroqAI } from "../../infrastructure/gateways/groq.gateway.js";
import { sendRegisterPrompt } from "./auth.shared.js";
import { logger } from "../../utils/logger.js";

interface ParsedTransaction {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  confidence: "high" | "medium" | "low";
  clarification?: string;
}

async function parseTransactionWithAI(
  naturalText: string,
): Promise<ParsedTransaction | null> {
  const systemPrompt =
    "Kamu adalah asisten pencatat keuangan. Ekstrak informasi transaksi dari teks bebas Bahasa Indonesia.\n\n" +
    '- type: "income" jika pemasukan, "expense" jika pengeluaran\n' +
    "- amount: jumlah uang dalam angka bulat\n" +
    "- category: kategori singkat 1-2 kata\n" +
    "- description: deskripsi singkat (maks 10 kata)\n" +
    '- confidence: "high"/"medium"/"low"\n' +
    "- clarification: pertanyaan jika confidence low\n\n" +
    "Jawab HANYA JSON valid:\n" +
    '{"type":"expense","amount":20000,"category":"makan","description":"nasi goreng 2 porsi","confidence":"high"}';

  try {
    const raw = await askGroqAI(naturalText, systemPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as ParsedTransaction;

    if (
      !parsed.type ||
      !["income", "expense"].includes(parsed.type) ||
      !parsed.amount ||
      typeof parsed.amount !== "number" ||
      parsed.amount <= 0 ||
      !parsed.category
    ) {
      return null;
    }

    return parsed;
  } catch (err) {
    logger.error({ err }, "❌ [Finance] AI parsing failed");
    return null;
  }
}

interface ParsedEditIntent {
  action: "edit" | "delete";
  idPrefix?: string;
  keywords?: string[];
  newAmount?: number;
  newCategory?: string;
  newDescription?: string;
  newType?: "income" | "expense";
  confidence: "high" | "medium" | "low";
  clarification?: string;
}

async function parseEditDeleteIntent(
  naturalText: string,
  recentTxs: Transaction[],
): Promise<ParsedEditIntent | null> {
  const txList = recentTxs
    .slice(0, 10)
    .map(
      (tx, i) =>
        `${i + 1}. ID:${tx.id.slice(0, 8)} | ${tx.type === "income" ? "pemasukan" : "pengeluaran"} | Rp${tx.amount} | ${tx.category}${tx.description ? ` | ${tx.description}` : ""} | ${tx.date}`,
    )
    .join("\n");

  const systemPrompt =
    "Kamu adalah asisten keuangan. Deteksi niat edit atau hapus transaksi dari teks bebas Bahasa Indonesia.\n\n" +
    `Transaksi terbaru:\n${txList}\n\n` +
    "Tentukan:\n" +
    '- action: "edit" atau "delete"\n' +
    "- idPrefix: 8 karakter pertama ID (atau null)\n" +
    "- keywords: array kata kunci untuk cocokkan transaksi (atau null)\n" +
    "- newAmount: jumlah baru jika edit (atau null)\n" +
    "- newCategory: kategori baru jika edit (atau null)\n" +
    "- newDescription: deskripsi baru jika edit (atau null)\n" +
    '- newType: "income"/"expense" jika tipe berubah (atau null)\n' +
    '- confidence: "high"/"medium"/"low"\n' +
    "- clarification: pertanyaan jika confidence low (atau null)\n\n" +
    "Jawab HANYA JSON valid:\n" +
    '{"action":"edit","idPrefix":null,"keywords":["makan siang"],"newAmount":35000,"newCategory":null,"newDescription":null,"newType":null,"confidence":"high","clarification":null}';

  try {
    const raw = await askGroqAI(naturalText, systemPrompt);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as ParsedEditIntent;
    if (!parsed.action || !["edit", "delete"].includes(parsed.action))
      return null;
    return parsed;
  } catch (err) {
    logger.error({ err }, "❌ [Finance] Edit/delete AI parsing failed");
    return null;
  }
}

function matchTransaction(
  txs: Transaction[],
  intent: ParsedEditIntent,
): Transaction | null {
  if (intent.idPrefix) {
    return txs.find((tx) => tx.id.startsWith(intent.idPrefix!)) ?? null;
  }
  if (intent.keywords && intent.keywords.length > 0) {
    const kws = intent.keywords.map((k) => k.toLowerCase());
    const matches = txs.filter((tx) => {
      const haystack = `${tx.category} ${tx.description ?? ""}`.toLowerCase();
      return kws.some((k) => haystack.includes(k));
    });
    return matches.length === 1 ? matches[0] : null;
  }
  return null;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function sendFinanceMenu(
  from: string,
  displayName?: string,
): Promise<void> {
  const greet = displayName ? ` ${displayName}` : "";
  const menuText =
    `\u256d\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n` +
    `\u2502  \ud83d\udcb0 *FINANCE MANAGER* \ud83d\udcb0\n` +
    `\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n` +
    `Halo${greet}! Mode keuangan aktif. \u2705\n\n` +
    `\ud83d\udcdd *Perintah yang tersedia:*\n\n` +
    `\u251c\u2500\u2726 *.catat <deskripsi>* \u2014 catat transaksi baru (AI)\n` +
    `\u2502   _Contoh: \`.catat beli nasi goreng 20rb\`_\n` +
    `\u2502\n` +
    `\u251c\u2500\u2726 *.edit <deskripsi edit>* \u2014 edit transaksi (AI)\n` +
    `\u2502   _Contoh: \`.edit transaksi makan tadi jadi 35000\`_\n` +
    `\u2502\n` +
    `\u251c\u2500\u2726 *.hapus <id atau deskripsi>* \u2014 hapus transaksi (AI)\n` +
    `\u2502   _Contoh: \`.hapus transaksi nasi goreng kemarin\`_\n` +
    `\u2502\n` +
    `\u251c\u2500\u2726 *.riwayat* \u2014 10 transaksi terakhir\n` +
    `\u251c\u2500\u2726 *.laporan* \u2014 ringkasan total keuangan\n` +
    `\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n` +
    `\ud83d\udca1 _Atau chat bebas untuk konsultasi keuangan dengan AI._`;

  await sendWhatsAppButtons(
    from,
    menuText,
    [
      { id: ".laporan", title: "\ud83d\udcca Laporan" },
      { id: ".riwayat", title: "\ud83d\udccb Riwayat" },
      { id: "action:exit", title: "\ud83d\udd34 Exit" },
    ],
    "\ud83d\udcb0 FINANCE MANAGER",
  );
}

export async function handleFinanceCommand(
  from: string,
  userText: string,
  senderName: string,
): Promise<boolean> {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();
  const session = getUserSession(from);



  if (session.pendingAction?.startsWith("awaiting:catat:confirm:")) {
    const isConfirm = lower === "konfirmasi" || lower === "catat:confirm";
    const isCancel = lower === "batal" || lower === "catat:cancel";

    if (isConfirm) {
      const jsonStr = session.pendingAction.slice(
        "awaiting:catat:confirm:".length,
      );
      try {
        const data = JSON.parse(jsonStr);
        setPendingAction(from, null);
        await sendWhatsAppMessage(from, "\u23f3 Menyimpan transaksi...");
        return saveCatatTransaction(
          from,
          senderName,
          data.type,
          data.amount,
          data.category,
          data.description,
        );
      } catch {
        setPendingAction(from, null);
        await sendWhatsAppMessage(
          from,
          "\u274c Data konfirmasi rusak. Silakan ulangi perintah .catat.",
        );
        return true;
      }
    }

    if (isCancel) {
      setPendingAction(from, null);
      await sendWhatsAppMessage(from, "\ud83d\udeab Transaksi dibatalkan.");
      return true;
    }

    const jsonStr = session.pendingAction.slice(
      "awaiting:catat:confirm:".length,
    );
    try {
      const data = JSON.parse(jsonStr);
      const icon = data.type === "income" ? "\ud83d\udcc8" : "\ud83d\udcc9";
      const label = data.type === "income" ? "Pemasukan" : "Pengeluaran";
      await sendWhatsAppButtons(
        from,
        `\u26a0\ufe0f Kamu belum mengkonfirmasi transaksi sebelumnya:\n\n${icon} *${label}* ${formatRupiah(data.amount)} \u2022 ${data.category}\n\nKonfirmasi atau batalkan dulu ya \ud83d\udc47`,
        [
          { id: "catat:confirm", title: "\u2705 Konfirmasi" },
          { id: "catat:cancel", title: "\u274c Batal" },
        ],
        "\u23f3 MENUNGGU KONFIRMASI",
      );
    } catch {
      setPendingAction(from, null);
    }
    return true;
  }

  if (session.pendingAction?.startsWith("awaiting:edit:confirm:")) {
    const isConfirm = lower === "konfirmasi" || lower === "edit:confirm";
    const isCancel = lower === "batal" || lower === "edit:cancel";

    if (isConfirm) {
      const jsonStr = session.pendingAction.slice(
        "awaiting:edit:confirm:".length,
      );
      try {
        const data = JSON.parse(jsonStr) as {
          txId: string;
          changes: Record<string, unknown>;
        };
        setPendingAction(from, null);
        await sendWhatsAppMessage(from, "\u23f3 Memperbarui transaksi...");
        const updated = await apiUpdateTransaction(
          from,
          senderName,
          data.txId,
          data.changes as any,
        );
        const icon =
          updated.type === "income" ? "\ud83d\udcc8" : "\ud83d\udcc9";
        await sendWhatsAppButtons(
          from,
          `\u2705 *Transaksi Diperbarui!*\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n${icon} ${formatRupiah(updated.amount)} \u2014 ${updated.category}${updated.description ? ` (${updated.description})` : ""}\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550`,
          [
            { id: ".riwayat", title: "\ud83d\udccb Riwayat" },
            { id: ".laporan", title: "\ud83d\udcca Laporan" },
          ],
          "\u270f\ufe0f TRANSAKSI DIPERBARUI",
        );
      } catch (err: any) {
        setPendingAction(from, null);
        await sendWhatsAppMessage(
          from,
          `\u274c Gagal memperbarui: ${err?.response?.data?.message ?? err?.message ?? "Coba lagi."}`,
        );
      }
      return true;
    }

    if (isCancel) {
      setPendingAction(from, null);
      await sendWhatsAppMessage(from, "\ud83d\udeab Edit dibatalkan.");
      return true;
    }

    const jsonStr2 = session.pendingAction.slice(
      "awaiting:edit:confirm:".length,
    );
    try {
      const data2 = JSON.parse(jsonStr2);
      await sendWhatsAppButtons(
        from,
        `\u26a0\ufe0f Konfirmasi atau batalkan perubahan transaksi \`${String(data2.txId).slice(0, 8)}\` dulu ya \ud83d\udc47`,
        [
          { id: "edit:confirm", title: "\u2705 Konfirmasi" },
          { id: "edit:cancel", title: "\u274c Batal" },
        ],
        "\u23f3 MENUNGGU KONFIRMASI",
      );
    } catch {
      setPendingAction(from, null);
    }
    return true;
  }

  if (session.pendingAction?.startsWith("awaiting:delete:confirm:")) {
    const isConfirm = lower === "konfirmasi" || lower === "delete:confirm";
    const isCancel = lower === "batal" || lower === "delete:cancel";

    if (isConfirm) {
      const jsonStr = session.pendingAction.slice(
        "awaiting:delete:confirm:".length,
      );
      try {
        const data = JSON.parse(jsonStr) as { txId: string; label: string };
        setPendingAction(from, null);
        await sendWhatsAppMessage(from, "\u23f3 Menghapus transaksi...");
        await apiDeleteTransaction(from, senderName, data.txId);
        await sendWhatsAppButtons(
          from,
          `\ud83d\uddd1\ufe0f *Transaksi Dihapus!*\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n~~${data.label}~~\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550`,
          [
            { id: ".riwayat", title: "\ud83d\udccb Riwayat" },
            { id: ".laporan", title: "\ud83d\udcca Laporan" },
          ],
          "\ud83d\uddd1\ufe0f TRANSAKSI DIHAPUS",
        );
      } catch (err: any) {
        setPendingAction(from, null);
        await sendWhatsAppMessage(
          from,
          `\u274c Gagal menghapus: ${err?.response?.data?.message ?? err?.message ?? "Coba lagi."}`,
        );
      }
      return true;
    }

    if (isCancel) {
      setPendingAction(from, null);
      await sendWhatsAppMessage(from, "\ud83d\udeab Penghapusan dibatalkan.");
      return true;
    }

    const jsonStr3 = session.pendingAction.slice(
      "awaiting:delete:confirm:".length,
    );
    try {
      const data3 = JSON.parse(jsonStr3);
      await sendWhatsAppButtons(
        from,
        `\u26a0\ufe0f Konfirmasi atau batalkan penghapusan transaksi \`${String(data3.txId).slice(0, 8)}\` dulu ya \ud83d\udc47`,
        [
          { id: "delete:confirm", title: "\ud83d\uddd1\ufe0f Ya, Hapus" },
          { id: "delete:cancel", title: "\u274c Batal" },
        ],
        "\u23f3 MENUNGGU KONFIRMASI",
      );
    } catch {
      setPendingAction(from, null);
    }
    return true;
  }

  if (lower === ".finance" || lower === ".keuangan") {
    setUserActiveMode(from, "finance");
    const token = await resolveAccessToken(from, senderName);
    if (token) {
      await sendFinanceMenu(from, senderName);
    } else {
      await sendRegisterPrompt(from);
    }
    return true;
  }

  if (lower === "auth:register") {
    await sendWhatsAppMessage(
      from,
      `Silakan buka tautan berikut untuk mendaftar akun Manager Anda:\n\n👉 https://justbot-manager.netlify.app/register`
    );
    return true;
  }

  const isFinanceCommand =
    lower.startsWith(".catat ") ||
    lower === ".riwayat" ||
    lower === ".riwayat masuk" ||
    lower === ".riwayat keluar" ||
    lower === ".laporan" ||
    lower === ".summary" ||
    lower.startsWith(".hapus ") ||
    lower.startsWith(".edit ") ||
    lower === "catat:confirm" ||
    lower === "catat:cancel" ||
    lower === "edit:confirm" ||
    lower === "edit:cancel" ||
    lower === "delete:confirm" ||
    lower === "delete:cancel";

  if (isFinanceCommand) {
    const token = await resolveAccessToken(from, senderName);
    if (!token) {
      await sendRegisterPrompt(from);
      return true;
    }
    return handleAuthenticatedCommand(from, lower, trimmed, senderName);
  }

  return false;
}

async function saveCatatTransaction(
  from: string,
  senderName: string,
  type: "income" | "expense",
  amount: number,
  category: string,
  description?: string,
): Promise<boolean> {
  try {
    const tx = await apiCreateTransaction(from, senderName, {
      type,
      amount,
      category,
      description,
      date: new Date().toISOString().split("T")[0],
    });

    const icon = type === "income" ? "\ud83d\udcc8" : "\ud83d\udcc9";
    const label = type === "income" ? "PEMASUKAN" : "PENGELUARAN";
    const replyText =
      `\u2705 *Transaksi Dicatat!*\n` +
      `\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n` +
      `${icon} *${label}*\n` +
      `\ud83d\udcb0 Jumlah    : ${formatRupiah(amount)}\n` +
      `\ud83c\udff7\ufe0f Kategori : ${category}${description ? `\n\ud83d\udcdd Deskripsi: ${description}` : ""}\n` +
      `\ud83d\udcc5 Tanggal  : ${formatDate(tx.date ?? new Date().toISOString())}\n` +
      `\ud83c\udd94 ID       : \`${tx.id.slice(0, 8)}...\`\n` +
      `\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n` +
      `_Gunakan \`.hapus ${tx.id.slice(0, 8)}\` untuk membatalkan._`;

    await sendWhatsAppButtons(
      from,
      replyText,
      [
        { id: ".riwayat", title: "\ud83d\udccb Lihat Riwayat" },
        { id: ".laporan", title: "\ud83d\udcca Laporan" },
      ],
      `${icon} TRANSAKSI DICATAT`,
    );
  } catch (err: any) {
    await sendWhatsAppMessage(
      from,
      `\u274c Gagal menyimpan: ${err?.response?.data?.message ?? err?.message ?? "Coba lagi."}`,
    );
  }
  return true;
}

async function handleAuthenticatedCommand(
  from: string,
  lower: string,
  trimmed: string,
  senderName: string,
): Promise<boolean> {
  
  if (lower.startsWith(".catat ")) {
    const parts = trimmed.slice(7).trim();

    const strictMatch = parts.match(
      /^(masuk|keluar)\s+(\d[\d.,]*)\s+(\S+)(?:\s+"([^"]*)")?(?:\s+(.*))?/i,
    );

    if (strictMatch) {
      const type =
        strictMatch[1].toLowerCase() === "masuk" ? "income" : "expense";
      const amount = parseInt(strictMatch[2].replace(/[.,]/g, ""), 10);
      const category = strictMatch[3];
      const description = strictMatch[4] ?? strictMatch[5] ?? undefined;

      if (isNaN(amount) || amount <= 0) {
        await sendWhatsAppMessage(
          from,
          "\u274c Jumlah tidak valid. Masukkan angka yang benar.",
        );
        return true;
      }

      await sendWhatsAppMessage(from, "\u23f3 Menyimpan transaksi...");
      return saveCatatTransaction(
        from,
        senderName,
        type,
        amount,
        category,
        description,
      );
    }

    await sendWhatsAppMessage(
      from,
      "\ud83e\udd16 _Memproses catatanmu dengan AI..._",
    );
    const parsed = await parseTransactionWithAI(parts);

    if (!parsed) {
      await sendWhatsAppMessage(
        from,
        `\u274c Maaf, saya tidak bisa memahami catatanmu.\n\n*Coba format yang lebih jelas:*\n\u2022 \`.catat keluar 20000 makan "nasi goreng 2 porsi"\`\n\u2022 \`.catat masuk 500000 gaji\`\n\nAtau deskripsikan ulang dengan menyebutkan *jumlah uang* yang lebih jelas.`,
      );
      return true;
    }

    const { type, amount, category, description, confidence, clarification } =
      parsed;
    const icon = type === "income" ? "\ud83d\udcc8" : "\ud83d\udcc9";
    const label = type === "income" ? "Pemasukan" : "Pengeluaran";
    const confidenceIcon =
      confidence === "high"
        ? "\u2705"
        : confidence === "medium"
          ? "\ud83d\udfe1"
          : "\ud83d\udd34";
    const extraNote =
      confidence === "low" && clarification
        ? `\n\n\u26a0\ufe0f _${clarification}_`
        : "";

    const confirmText =
      `\ud83e\udd16 *AI mendeteksi transaksi ini:*${extraNote}\n\n` +
      `${icon} *${label}*\n` +
      `\u251c\u2500 Jumlah    : *${formatRupiah(amount)}*\n` +
      `\u251c\u2500 Kategori  : ${category}\n` +
      `\u2570\u2500 Deskripsi : ${description || "-"}\n\n` +
      `${confidenceIcon} _Keyakinan AI: ${confidence}_\n\n` +
      `Konfirmasi atau batalkan transaksi ini \ud83d\udc47`;

    setPendingAction(
      from,
      `awaiting:catat:confirm:${JSON.stringify({ type, amount, category, description })}`,
    );
    await sendWhatsAppButtons(
      from,
      confirmText,
      [
        { id: "catat:confirm", title: "\u2705 Konfirmasi" },
        { id: "catat:cancel", title: "\u274c Batal" },
      ],
      `${icon} KONFIRMASI TRANSAKSI`,
    );
    return true;
  }

  if (
    lower === ".riwayat" ||
    lower === ".riwayat masuk" ||
    lower === ".riwayat keluar"
  ) {
    const filterType =
      lower === ".riwayat masuk"
        ? "income"
        : lower === ".riwayat keluar"
          ? "expense"
          : undefined;
    await sendWhatsAppMessage(from, "\u23f3 Mengambil riwayat transaksi...");

    try {
      const txs = await apiGetTransactions(from, senderName, {
        type: filterType,
        limit: 10,
      });

      if (!txs || txs.length === 0) {
        await sendWhatsAppButtons(
          from,
          "\ud83d\udce4 Belum ada transaksi yang tercatat.",
          [{ id: ".catat ", title: "\u2795 Catat Transaksi" }],
          "\ud83d\udccb RIWAYAT KOSONG",
        );
        return true;
      }

      const lines = txs.map((tx, i) => {
        const ic = tx.type === "income" ? "\ud83d\udcc8" : "\ud83d\udcc9";
        const sign = tx.type === "income" ? "+" : "-";
        return `${i + 1}. ${ic} *${sign}${formatRupiah(tx.amount)}*\n   \ud83c\udff7\ufe0f ${tx.category}${tx.description ? ` \u2014 ${tx.description}` : ""}\n   \ud83d\udcc5 ${formatDate(tx.date)}\n   \ud83c\udd94 \`${tx.id.slice(0, 8)}\``;
      });

      const title =
        filterType === "income"
          ? "\ud83d\udcc8 RIWAYAT PEMASUKAN"
          : filterType === "expense"
            ? "\ud83d\udcc9 RIWAYAT PENGELUARAN"
            : "\ud83d\udccb RIWAYAT TRANSAKSI";
      const replyText =
        `\u256d\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\u2502  ${title}\n\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n` +
        `${lines.join("\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n")}\n` +
        `\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n` +
        `_Gunakan \`.edit\` atau \`.hapus\` + deskripsi bebas untuk mengelola._`;

      await sendWhatsAppButtons(
        from,
        replyText,
        [
          { id: ".laporan", title: "\ud83d\udcca Laporan" },
          { id: ".finance", title: "\ud83d\udcb0 Menu Finance" },
        ],
        title,
      );
    } catch (err: any) {
      await sendWhatsAppMessage(
        from,
        `\u274c Gagal mengambil riwayat: ${err?.message ?? "Coba lagi."}`,
      );
    }
    return true;
  }

  if (lower === ".laporan" || lower === ".summary") {
    await sendWhatsAppMessage(from, "\u23f3 Mengambil laporan keuangan...");

    try {
      const summary = await apiGetFinanceSummary(from, senderName);
      const balance = summary.balance;
      const balanceIcon = balance >= 0 ? "\ud83d\udfe2" : "\ud83d\udd34";
      const balanceLabel = balance >= 0 ? "Surplus" : "Defisit";

      const replyText =
        `\u256d\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\u2502  \ud83d\udcca *LAPORAN KEUANGAN*\n\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n` +
        `\ud83d\udcc8 *Total Pemasukan* : ${formatRupiah(summary.totalIncome)}\n` +
        `\ud83d\udcc9 *Total Pengeluaran*: ${formatRupiah(summary.totalExpense)}\n` +
        `\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n` +
        `${balanceIcon} *${balanceLabel}*      : ${formatRupiah(Math.abs(balance))}\n` +
        `\ud83d\udcd1 Jumlah Transaksi : ${summary.transactionCount}\n` +
        `\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n` +
        `${balance >= 0 ? "\u2728 Keuangan kamu sehat! Pertahankan!" : "\u26a0\ufe0f Pengeluaran melebihi pemasukan!"}`;

      await sendWhatsAppButtons(
        from,
        replyText,
        [
          { id: ".riwayat", title: "\ud83d\udccb Lihat Riwayat" },
          { id: ".finance", title: "\ud83d\udcb0 Menu Finance" },
        ],
        "\ud83d\udcca LAPORAN KEUANGAN",
      );
    } catch (err: any) {
      await sendWhatsAppMessage(
        from,
        `\u274c Gagal mengambil laporan: ${err?.message ?? "Coba lagi."}`,
      );
    }
    return true;
  }

  if (lower.startsWith(".edit ")) {
    const editText = trimmed.slice(6).trim();
    if (!editText) {
      await sendWhatsAppMessage(
        from,
        "\u274c Jelaskan transaksi mana yang ingin diedit.\n_Contoh: `.edit transaksi makan siang tadi jadi 35000`_",
      );
      return true;
    }

    await sendWhatsAppMessage(
      from,
      "\ud83e\udd16 _Mencari transaksi yang dimaksud..._",
    );
    const txsEdit = await apiGetTransactions(from, senderName, { limit: 20 });
    const intent = await parseEditDeleteIntent(editText, txsEdit);

    if (!intent || intent.action !== "edit") {
      await sendWhatsAppMessage(
        from,
        "\u274c Tidak bisa memahami transaksi mana yang ingin diedit.\n\nCoba sebutkan deskripsi atau ID-nya:\n_Contoh: `.edit transaksi makan siang tadi jadi 35000`_",
      );
      return true;
    }

    const targetEdit = matchTransaction(txsEdit, intent);
    if (!targetEdit) {
      await sendWhatsAppMessage(
        from,
        `\u274c Tidak bisa menemukan transaksi yang cocok.${intent.clarification ? `\n\n\u26a0\ufe0f ${intent.clarification}` : ""}\n\nGunakan *.riwayat* untuk melihat daftar transaksi beserta ID-nya.`,
      );
      return true;
    }

    const changes: Record<string, unknown> = {};
    if (intent.newAmount !== undefined && intent.newAmount !== null)
      changes.amount = intent.newAmount;
    if (intent.newCategory) changes.category = intent.newCategory;
    if (intent.newDescription !== undefined && intent.newDescription !== null)
      changes.description = intent.newDescription;
    if (intent.newType) changes.type = intent.newType;

    if (Object.keys(changes).length === 0) {
      await sendWhatsAppMessage(
        from,
        "\u274c Tidak ada perubahan yang terdeteksi. Sebutkan apa yang ingin diubah (jumlah, kategori, dll).",
      );
      return true;
    }

    const txIcon =
      targetEdit.type === "income" ? "\ud83d\udcc8" : "\ud83d\udcc9";
    const changeLines = [
      intent.newAmount !== undefined && intent.newAmount !== null
        ? `\u251c\u2500 Jumlah   : ${formatRupiah(targetEdit.amount)} \u2192 *${formatRupiah(intent.newAmount)}*`
        : null,
      intent.newCategory
        ? `\u251c\u2500 Kategori : ${targetEdit.category} \u2192 *${intent.newCategory}*`
        : null,
      intent.newDescription !== undefined
        ? `\u251c\u2500 Deskripsi: ${targetEdit.description || "-"} \u2192 *${intent.newDescription || "-"}*`
        : null,
      intent.newType
        ? `\u251c\u2500 Tipe     : ${targetEdit.type} \u2192 *${intent.newType}*`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const editConfirmText =
      `\u270f\ufe0f *Konfirmasi Perubahan Transaksi*\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n` +
      `${txIcon} *${targetEdit.category}*${targetEdit.description ? ` \u2014 ${targetEdit.description}` : ""}\n` +
      `\ud83c\udd94 \`${targetEdit.id.slice(0, 8)}\`\n\n` +
      `*Perubahan:*\n${changeLines}\n\nKonfirmasi atau batalkan \ud83d\udc47`;

    setPendingAction(
      from,
      `awaiting:edit:confirm:${JSON.stringify({ txId: targetEdit.id, changes })}`,
    );
    await sendWhatsAppButtons(
      from,
      editConfirmText,
      [
        { id: "edit:confirm", title: "\u2705 Konfirmasi" },
        { id: "edit:cancel", title: "\u274c Batal" },
      ],
      "\u270f\ufe0f KONFIRMASI EDIT",
    );
    return true;
  }

  if (lower.startsWith(".hapus ")) {
    const hapusText = trimmed.slice(7).trim();
    if (!hapusText) {
      await sendWhatsAppMessage(
        from,
        "\u274c Sebutkan ID atau deskripsi transaksi yang ingin dihapus.",
      );
      return true;
    }

    await sendWhatsAppMessage(
      from,
      "\ud83e\udd16 _Mencari transaksi yang dimaksud..._",
    );
    const txsHapus = await apiGetTransactions(from, senderName, { limit: 20 });

    let targetHapus =
      txsHapus.find((tx) => tx.id.startsWith(hapusText)) ?? null;
    if (!targetHapus) {
      const intentHapus = await parseEditDeleteIntent(hapusText, txsHapus);
      if (intentHapus) targetHapus = matchTransaction(txsHapus, intentHapus);
    }

    if (!targetHapus) {
      await sendWhatsAppMessage(
        from,
        "\u274c Tidak bisa menemukan transaksi yang cocok.\n\nGunakan *.riwayat* untuk melihat daftar transaksi beserta ID-nya.",
      );
      return true;
    }

    const hapusIcon =
      targetHapus.type === "income" ? "\ud83d\udcc8" : "\ud83d\udcc9";
    const hapusLabel = `${formatRupiah(targetHapus.amount)} \u2014 ${targetHapus.category}${targetHapus.description ? ` (${targetHapus.description})` : ""}`;

    setPendingAction(
      from,
      `awaiting:delete:confirm:${JSON.stringify({ txId: targetHapus.id, label: hapusLabel })}`,
    );
    await sendWhatsAppButtons(
      from,
      `\ud83d\uddd1\ufe0f *Hapus Transaksi?*\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n${hapusIcon} *${hapusLabel}*\n\ud83d\udcc5 ${formatDate(targetHapus.date)}\n\ud83c\udd94 \`${targetHapus.id.slice(0, 8)}\`\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\nTransaksi ini akan dihapus permanen \ud83d\udc47`,
      [
        { id: "delete:confirm", title: "\ud83d\uddd1\ufe0f Ya, Hapus" },
        { id: "delete:cancel", title: "\u274c Batal" },
      ],
      "\ud83d\uddd1\ufe0f KONFIRMASI HAPUS",
    );
    return true;
  }

  return false;
}
