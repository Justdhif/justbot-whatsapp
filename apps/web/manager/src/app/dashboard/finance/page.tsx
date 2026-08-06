'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Calendar,
  Loader2, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface FinanceSummary {
  income: number;
  expense: number;
  balance: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  category: string;
  createdAt: string;
}

interface TransactionListResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export default function FinanceManager() {
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<FinanceSummary>({ income: 0, expense: 0, balance: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Pagination & Filtering
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  
  // Create Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Form State
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().substring(0, 10));
  
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadSummary = useCallback(async () => {
    try {
      const res = await apiFetch<any>('/finance/summary');
      const payload = res?.data || res;
      setSummary({
        income: parseFloat(payload?.totalIncome || '0'),
        expense: parseFloat(payload?.totalExpense || '0'),
        balance: parseFloat(payload?.balance || '0'),
      });
    } catch (err) {
      console.error('Error loading finance summary:', err);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      let query = `/finance/transactions?page=${page}&limit=${limit}`;
      if (typeFilter !== 'all') query += `&type=${typeFilter}`;
      if (categoryFilter) query += `&category=${encodeURIComponent(categoryFilter)}`;
      
      const res = await apiFetch<TransactionListResponse | Transaction[]>(query);
      
      if (Array.isArray(res)) {
        setTransactions(res);
        setTotalCount(res.length);
      } else {
        const payload = (res as any).data || res.data || [];
        setTransactions(payload);
        setTotalCount(res.total || payload.length);
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, typeFilter, categoryFilter]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || isNaN(Number(formAmount)) || Number(formAmount) <= 0) {
      setErrorMsg('Masukkan jumlah nominal yang valid');
      return;
    }
    if (!formCategory) {
      setErrorMsg('Kategori wajib diisi');
      return;
    }
    
    setSubmitting(true);
    setErrorMsg('');
    
    try {
      await apiFetch('/finance/transactions', {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(formAmount),
          type: formType,
          category: formCategory.toLowerCase().trim(),
          description: formDescription.trim() || undefined,
          createdAt: new Date(formDate).toISOString()
        })
      });
      
      // Reset form & reload
      setFormAmount('');
      setFormCategory('');
      setFormDescription('');
      setFormDate(new Date().toISOString().substring(0, 10));
      setShowAddModal(false);
      
      await Promise.all([loadSummary(), loadTransactions()]);
    } catch (err: any) {
      console.error('Error adding transaction:', err);
      setErrorMsg(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
    
    try {
      await apiFetch(`/finance/transactions/${id}`, { method: 'DELETE' });
      await Promise.all([loadSummary(), loadTransactions()]);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Gagal menghapus transaksi');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Group by category helper for visualization
  const getCategoryStats = () => {
    const stats: Record<string, { amount: number; type: 'income' | 'expense' }> = {};
    transactions.forEach(t => {
      const cat = t.category.charAt(0).toUpperCase() + t.category.slice(1);
      if (!stats[cat]) stats[cat] = { amount: 0, type: t.type };
      stats[cat].amount += t.amount;
    });
    
    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount);
  };

  const categoryStats = getCategoryStats();
  const maxCategoryAmount = categoryStats.length > 0 ? Math.max(...categoryStats.map(c => c.amount)) : 1;

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-2.5">
            <Wallet className="h-7 w-7 text-zinc-400" /> Manajer Keuangan
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Pantau arus kas masuk, pengeluaran, dan analisis kategori keuangan Anda.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors shrink-0"
        >
          <Plus className="h-4.5 w-4.5" /> Catat Transaksi
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance */}
        <div className="glow-card rounded-xl p-6 bg-zinc-950/40">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Saldo Bersih</p>
          <p className="text-2xl font-bold tracking-tight text-white font-mono mt-2">
            {formatCurrency(summary.balance)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-3">
            <Sparkles className="h-3 w-3 text-zinc-400" /> Total tabungan tersisa
          </div>
        </div>

        {/* Income */}
        <div className="glow-card rounded-xl p-6 bg-zinc-950/40">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Pemasukan</p>
          <p className="text-2xl font-bold tracking-tight text-emerald-500 font-mono mt-2">
            {formatCurrency(summary.income)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600/80 mt-3 font-medium">
            <TrendingUp className="h-3.5 w-3.5" /> Arus kas masuk aktif
          </div>
        </div>

        {/* Expense */}
        <div className="glow-card rounded-xl p-6 bg-zinc-950/40">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Pengeluaran</p>
          <p className="text-2xl font-bold tracking-tight text-red-400 font-mono mt-2">
            {formatCurrency(summary.expense)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-red-400/80 mt-3 font-medium">
            <TrendingDown className="h-3.5 w-3.5" /> Arus kas keluar aktif
          </div>
        </div>
      </div>

      {/* Analytics & Breakdown */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cashflow Ratio Visualizer */}
          <div className="glow-card rounded-xl p-6 bg-zinc-950/20 lg:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Persentase Pengeluaran</h3>
              <p className="text-xs text-zinc-500">Berapa banyak dari pemasukan yang telah dibelanjakan</p>
            </div>
            
            <div className="my-6">
              {summary.income > 0 ? (
                <>
                  <div className="flex justify-between text-xs font-mono text-zinc-400 mb-2">
                    <span>Spent: {((summary.expense / summary.income) * 100).toFixed(1)}%</span>
                    <span>Saved: {(((summary.income - summary.expense) / summary.income) * 100).toFixed(1)}%</span>
                  </div>
                  {/* Custom Progress bar */}
                  <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-red-500 h-full rounded-l-full transition-all duration-500" 
                      style={{ width: `${Math.min((summary.expense / summary.income) * 100, 100)}%` }}
                    />
                    <div 
                      className="bg-emerald-500 h-full rounded-r-full flex-1 transition-all duration-500" 
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-xs text-zinc-500 font-mono">
                  Belum ada pemasukan tercatat untuk kalkulasi rasio.
                </div>
              )}
            </div>

            <div className="flex justify-between text-[11px] text-zinc-500 border-t border-zinc-900/60 pt-3">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Pengeluaran</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Tabungan</span>
            </div>
          </div>

          {/* Category List visual breakdown */}
          <div className="glow-card rounded-xl p-6 bg-zinc-950/20">
            <h3 className="text-sm font-semibold text-white mb-4">Pengeluaran per Kategori</h3>
            {categoryStats.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">Tidak ada data visualisasi</p>
            ) : (
              <div className="space-y-4">
                {categoryStats.slice(0, 4).map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400 font-medium">{cat.name}</span>
                      <span className="text-zinc-300 font-semibold font-mono">{formatCurrency(cat.amount)}</span>
                    </div>
                    {/* SVG mini progress bar */}
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          cat.type === 'income' ? 'bg-emerald-500' : 'bg-zinc-300'
                        }`}
                        style={{ width: `${(cat.amount / maxCategoryAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter and Transactions List Pane */}
      <div className="glow-card rounded-xl p-6 bg-zinc-950/20 space-y-6">
        
        {/* Filtering Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-zinc-900">
          {/* Search Category */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari kategori..."
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1); // reset to page 1 on search change
              }}
              className="pl-9 pr-4 h-9 w-full rounded-lg bg-zinc-950 border border-zinc-900 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-950 border border-zinc-900 shrink-0">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setPage(1);
                }}
                className={`px-3.5 h-7 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                  typeFilter === t 
                    ? 'bg-zinc-900 text-white shadow' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t === 'all' ? 'Semua' : t === 'income' ? 'Masuk' : 'Keluar'}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table / List */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="h-7 w-7 text-zinc-600 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-zinc-900 rounded-xl">
            <p className="text-sm text-zinc-500">Tidak ada transaksi ditemukan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table Headers (only visible md+) */}
            <div className="hidden md:grid grid-cols-12 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider pb-2 border-b border-zinc-900">
              <div className="col-span-3">Tanggal</div>
              <div className="col-span-4">Keterangan</div>
              <div className="col-span-2">Kategori</div>
              <div className="col-span-2 text-right">Nominal</div>
              <div className="col-span-1 text-right"></div>
            </div>

            {/* List Rows */}
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 md:gap-0 p-4 md:p-3 rounded-lg bg-zinc-950/80 border border-zinc-900 hover:border-zinc-800 transition-colors"
                >
                  {/* Date Column */}
                  <div className="col-span-3 text-xs text-zinc-400 font-mono">
                    {new Date(tx.createdAt).toLocaleDateString('id-ID', { 
                      weekday: 'short',
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  
                  {/* Description Column */}
                  <div className="col-span-4 text-sm font-medium text-white truncate">
                    {tx.description || <span className="text-zinc-600 italic">Tanpa Keterangan</span>}
                  </div>
                  
                  {/* Category Column */}
                  <div className="col-span-2">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800 capitalize">
                      {tx.category}
                    </span>
                  </div>

                  {/* Amount Column */}
                  <div className={`col-span-2 md:text-right text-sm font-semibold font-mono ${
                    tx.type === 'income' ? 'text-emerald-500' : 'text-red-400'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(Math.abs(tx.amount))}
                  </div>

                  {/* Action Column */}
                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="text-zinc-600 hover:text-red-500 p-1.5 rounded hover:bg-red-950/20 transition-colors"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                <span className="text-xs text-zinc-500 font-mono">
                  Halaman {page} dari {totalPages} ({totalCount} item)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    className="h-8 w-8 rounded-lg bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white hover:border-zinc-800 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    className="h-8 w-8 rounded-lg bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white hover:border-zinc-800 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Add Transaction Dialog/Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glow-card rounded-2xl w-full max-w-md bg-zinc-950 p-6 space-y-6 relative animate-in zoom-in duration-300">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors p-1"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div>
              <h3 className="text-lg font-semibold text-white">Catat Transaksi Baru</h3>
              <p className="text-xs text-zinc-500 mt-1">Tambahkan catatan keuangan secara manual.</p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/20 border border-red-900 text-red-400 rounded-lg text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* Type Switch */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormType('expense')}
                  className={`flex-1 h-10 rounded-lg border font-semibold text-sm transition-all ${
                    formType === 'expense'
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('income')}
                  className={`flex-1 h-10 rounded-lg border font-semibold text-sm transition-all ${
                    formType === 'income'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  Pemasukan
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Nominal (Rupiah)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 50000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 font-mono"
                />
              </div>

              {/* Category Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: makanan, gaji, hiburan, dll"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 capitalize"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Keterangan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Beli makan siang nasi padang"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                />
              </div>

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Tanggal Transaksi</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="h-10 w-full rounded-lg bg-zinc-950 border border-zinc-900 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 font-mono"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-10 rounded-lg bg-zinc-900 text-white border border-zinc-800 font-semibold text-sm hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-10 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
