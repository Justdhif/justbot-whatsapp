'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  Plus, 
  MessageSquare, 
  Send, 
  Cpu, 
  Clock, 
  Wallet, 
  Languages, 
  FileText, 
  Terminal, 
  Tags, 
  CheckCircle2, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  QrCode,
  ShieldAlert,
  Loader2,
  AlertTriangle,
  TrendingDown,
  Camera,
  Mail,
  Smile,
  Video,
  CalendarCheck
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface FinanceSummary {
  income: number;
  expense: number;
  balance: number;
}

interface BotConfig {
  id: string;
  effectiveDays: number[];
  effectiveHourStart: string;
  effectiveHourEnd: string;
  isMaintenance: boolean;
  timezone: string;
}

interface Reminder {
  id: string;
  title: string;
  remindAt: string;
  isSent: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  category: string;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  icon: string;
  message: string;
  time: string;
  color: string;
}

export default function DashboardOverview() {
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<FinanceSummary>({ income: 0, expense: 0, balance: 0 });
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [chartDataState, setChartDataState] = useState<{ labels: string[]; values: number[] } | null>(null);
  
  // Interactive states
  const [statsPeriod, setStatsPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  // Load backend data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sumRes, configRes, remRes, txRes, activityRes] = await Promise.all([
          apiFetch<any>('/finance/summary'),
          apiFetch<{ data: BotConfig }>('/bot-configurations'),
          apiFetch<Reminder[]>('/reminders'),
          apiFetch<{ data: Transaction[]; total: number } | Transaction[]>('/finance/transactions?limit=20'),
          apiFetch<any>('/analytics/recent-activity'),
        ]);

        const sumPayload = sumRes?.data || sumRes;
        const configPayload = configRes?.data || configRes;
        const remPayload = (remRes as any)?.data || remRes;
        const activityPayload = activityRes?.data || activityRes;
        
        let txPayload: Transaction[] = [];
        if (Array.isArray(txRes)) {
          txPayload = txRes;
        } else if (txRes && (txRes as any).data) {
          txPayload = (txRes as any).data;
        }

        setSummary({
          income: parseFloat(sumPayload?.totalIncome || '0'),
          expense: parseFloat(sumPayload?.totalExpense || '0'),
          balance: parseFloat(sumPayload?.balance || '0'),
        });
        setBotConfig(configPayload);
        setReminders(remPayload || []);
        setTransactions(txPayload || []);
        setRecentActivities(activityPayload || []);
      } catch (err) {
        console.error('Error loading dashboard overview data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load chart data dynamically based on statsPeriod selection
  useEffect(() => {
    const loadChartData = async () => {
      try {
        const res = await apiFetch<any>(`/analytics/message-stats?period=${statsPeriod}`);
        const payload = res?.data || res;
        setChartDataState(payload);
      } catch (err) {
        console.error('Error loading message stats:', err);
      }
    };
    loadChartData();
  }, [statsPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getDayNames = (days: number[]) => {
    const dayMap: { [key: number]: string } = {
      0: 'Minggu',
      1: 'Senin',
      2: 'Selasa',
      3: 'Rabu',
      4: 'Kamis',
      5: 'Jumat',
      6: 'Sabtu'
    };
    return days.map(d => dayMap[d]).join(', ');
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return MessageSquare;
      case 'Send': return Send;
      case 'Cpu': return Cpu;
      case 'Wallet': return Wallet;
      default: return MessageSquare;
    }
  };

  // 10 real modules of JustBot from bot-service
  const modulesList = [
    { id: 'coding', label: 'Coding Assistant', desc: 'Bantuan penulisan & debug kode pemrograman', icon: Terminal },
    { id: 'finance', label: 'Finance Consultant', desc: 'Konsultasi keuangan & manajemen budget', icon: Wallet },
    { id: 'creator', label: 'Content Creator', desc: 'Ide & naskah konten TikTok/Reels', icon: Video },
    { id: 'pdf', label: 'PDF & Document AI', desc: 'Rangkum & bedah dokumen PDF', icon: FileText },
    { id: 'ocr', label: 'OCR Scanner', desc: 'Mengekstrak tulisan dari gambar', icon: Camera },
    { id: 'translate', label: 'Polyglot Translator', desc: 'Terjemahan bahasa kontekstual alami', icon: Languages },
    { id: 'reminder', label: 'Agenda & Reminder', desc: 'Mengatur tugas & to-do list harian', icon: Clock },
    { id: 'email', label: 'Executive Email', desc: 'Penyusunan draf email profesional', icon: Mail },
    { id: 'sticker', label: 'Sticker Generator', desc: 'Membuat stiker biasa & teks Brat', icon: Smile },
    { id: 'util', label: 'Smart Utilities', desc: 'Kalkulator instan & konversi satuan', icon: Cpu }
  ];

  // Map active stats data for Recharts
  const chartData = chartDataState
    ? chartDataState.labels.map((label, index) => ({
        date: label,
        pesan: chartDataState.values[index] || 0,
      }))
    : [];

  const maxChartVal = chartDataState && chartDataState.values.length > 0
    ? Math.max(...chartDataState.values) * 1.25
    : 100;

  // Calendar rendering helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Pad previous month days
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Present month days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const daysGrid = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Today's Reminders (Agenda) filtered by selected date
  const todaysReminders = reminders.filter(r => isSameDay(new Date(r.remindAt), selectedDate));

  // Dynamic Transaction Filtering based on selectedDate
  const filteredTransactions = transactions.filter(t => isSameDay(new Date(t.createdAt), selectedDate));

  const chartConfig = {
    pesan: {
      label: "Pesan",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  if (loading) {
    return (
      <div className="h-[75vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-zinc-500 text-sm mt-3">Memuat overview dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Status Bot */}
        <div className="glow-card rounded-2xl p-6 bg-zinc-950/40 border border-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-400">Status WhatsApp Bot</h3>
            <img src="/favicon.png" alt="Bot Logo" className="h-5 w-5 object-contain opacity-70" />
          </div>
          {botConfig?.isMaintenance ? (
            <div className="flex items-center gap-2 text-orange-400 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-lg font-semibold tracking-tight">Maintenance Mode</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-500 mb-4">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-lg font-semibold tracking-tight">Aktif & Siap</span>
            </div>
          )}
          <div className="space-y-1 text-xs text-zinc-500 border-t border-zinc-900 pt-3">
            <p>Hari Kerja: <span className="text-zinc-300">{botConfig?.effectiveDays ? getDayNames(botConfig.effectiveDays) : 'Senin - Jumat'}</span></p>
            <p>Jam Kerja: <span className="text-zinc-300">{botConfig?.effectiveHourStart} - {botConfig?.effectiveHourEnd}</span></p>
            <p>Timezone: <span className="text-zinc-300">{botConfig?.timezone || 'Asia/Jakarta'}</span></p>
          </div>
        </div>

        {/* Keuangan Ringkasan */}
        <div className="glow-card rounded-2xl p-6 bg-zinc-950/40 border border-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-400">Total Saldo Bersih</h3>
            <TrendingUp className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-white font-mono mb-4">
            {formatCurrency(summary.balance)}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-zinc-900 pt-3">
            <div>
              <p className="text-zinc-500">Pemasukan</p>
              <p className="text-emerald-500 font-semibold font-mono mt-0.5">{formatCurrency(summary.income)}</p>
            </div>
            <div>
              <p className="text-zinc-500">Pengeluaran</p>
              <p className="text-red-400 font-semibold font-mono mt-0.5">{formatCurrency(summary.expense)}</p>
            </div>
          </div>
        </div>

        {/* Pengingat Card */}
        <div className="glow-card rounded-2xl p-6 bg-zinc-950/40 border border-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-400">Pengingat Aktif</h3>
            <Calendar className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-white font-mono mb-4">
            {reminders.length}
          </p>
          <div className="space-y-1 text-xs text-zinc-500 border-t border-zinc-900 pt-3 flex items-center justify-between">
            <span>Agenda terdekat hari ini</span>
            <Link href="/dashboard/reminders" className="text-white hover:underline flex items-center gap-0.5">
              Kelola <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

      </div>

      {/* Overview stats layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Charts & Bot Activity & Modules & WhatsApp CTA */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STATISTIK AKTIVITAS CARD */}
          <div className="glow-card rounded-2xl p-6 bg-zinc-950/40 border border-zinc-900">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-zinc-200">Statistik Aktivitas</h3>
                <HelpCircle className="h-4 w-4 text-zinc-500 cursor-pointer hover:text-zinc-300" />
              </div>
              
              {/* Period selection tabs */}
              <div className="flex p-0.5 bg-zinc-950 border border-zinc-900 rounded-lg text-xs font-medium">
                {(['7d', '30d', '90d'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setStatsPeriod(p);
                    }}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      statsPeriod === p 
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {p === '7d' ? '7 Hari' : p === '30d' ? '30 Hari' : '90 Hari'}
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Recharts Line/Area Chart */}
            <div className="h-[210px] w-full mt-2 select-none">
              <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
                <AreaChart 
                  data={chartData} 
                  margin={{ left: -22, right: 10, top: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPesan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={10}
                    stroke="rgba(255, 255, 255, 0.3)"
                    className="font-mono text-[9px]"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    stroke="rgba(255, 255, 255, 0.3)"
                    className="font-mono text-[9px]"
                    domain={[0, Math.ceil(maxChartVal / 10) * 10]}
                    width={32}
                  />
                  <Tooltip 
                    content={<ChartTooltipContent />} 
                    cursor={{ stroke: "rgba(255, 255, 255, 0.08)", strokeWidth: 1 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pesan" 
                    stroke="var(--primary)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPesan)" 
                    dot={{ r: 4, stroke: "black", strokeWidth: 1.5, fill: "var(--primary)" }}
                    activeDot={{ r: 6, stroke: "black", strokeWidth: 1.5, fill: "var(--primary)" }}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>

          {/* AKTIVITAS TERBARU CARD (Recent bot operation logs, under chart) */}
          <div className="glow-card rounded-2xl p-6 bg-zinc-950/40 border border-zinc-900">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-zinc-200">Aktivitas Terbaru</h3>
            </div>

            {/* Logs activity stack */}
            <div className="space-y-4">
              {recentActivities.map((act) => {
                const IconComponent = getIconComponent(act.icon);
                return (
                  <div key={act.id} className="flex items-start justify-between gap-3.5">
                    <div className="flex items-start gap-3.5 overflow-hidden">
                      <div className={`h-8 w-8 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center shrink-0 ${act.color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-zinc-300 leading-tight truncate">{act.message}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">{act.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MODUL BOT CARD (Horizontal scroll with side-fades) */}
          <div className="glow-card rounded-2xl p-6 bg-zinc-950/40 border border-zinc-900 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-zinc-200">Modul Bot</h3>
            </div>

            {/* Horizontal slider container */}
            <div className="relative w-full -mx-2">
              {/* Left Gradient Edge Fade */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none z-10" />
              
              {/* Horizontal Scroll Area */}
              <div className="flex gap-4 overflow-x-auto scrollbar-none py-1.5 px-6 scroll-smooth">
                {modulesList.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div 
                      key={m.id} 
                      className="glow-card bg-zinc-950/70 border border-zinc-900/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center w-[115px] shrink-0 hover:border-primary/40 group transition-all cursor-pointer"
                    >
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all mb-3.5">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-primary transition-colors truncate w-full">{m.label}</span>
                      <span className="text-[9px] text-zinc-500 mt-1 line-clamp-2 leading-tight w-full">{m.desc}</span>
                    </div>
                  );
                })}
              </div>

              {/* Right Gradient Edge Fade */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none z-10" />
            </div>
          </div>

          {/* Premium Chat CTA Card */}
          <div className="glow-card bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start gap-4 z-10">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5 border border-primary/20 shadow-inner">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-[420px]">
                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  Hubungkan & Chat dengan JustBot Anda
                </h4>
                <p className="text-xs text-zinc-405 leading-relaxed text-zinc-400">
                  Uji instruksi, catat transaksi keuangan, dan atur agenda pengingat secara interaktif melalui chat WhatsApp di smartphone Anda.
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/${botConfig?.id || '6282211223344'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 h-10 bg-primary hover:bg-primary/95 text-black font-bold text-xs rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center gap-1.5 shrink-0 z-10"
            >
              Chat di WhatsApp <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

        </div>

        {/* RIGHT COLUMN: Calendar & Today Agenda & Transaction Timeline */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* CALENDAR & AGENDA CONTAINER */}
          <div className="glow-card rounded-2xl bg-zinc-950/40 border border-zinc-900 overflow-hidden flex flex-col">
            
            {/* Calendar Block */}
            <div className="p-6 border-b border-zinc-900/60">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-200">Kalender</h3>
                
                {/* Month Picker dropdown styles */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={prevMonth}
                    className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-bold text-white px-1">
                    {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={nextMonth}
                    className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500 mb-2">
                <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {daysGrid.map((day, idx) => {
                  if (!day) return <span key={`empty-${idx}`} />;
                  
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`h-7.5 w-7.5 rounded-full flex items-center justify-center transition-all mx-auto ${
                        isSelected 
                          ? 'bg-primary text-black font-bold scale-110 shadow-lg shadow-primary/25' 
                          : isToday 
                            ? 'border border-primary/45 text-primary font-semibold'
                            : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AGENDA HARI INI BLOCK */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4.5">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Agenda Hari Ini</h4>
                <Link 
                  href="/dashboard/reminders" 
                  className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline bg-primary/10 border border-primary/20 px-2 py-1 rounded-md"
                >
                  <Plus className="h-3 w-3" /> Tambah
                </Link>
              </div>

              {/* Reminders layout list as a premium vertical timeline */}
              <div className="space-y-4.5 relative pl-1">
                {todaysReminders.length > 0 ? (
                  todaysReminders.slice(0, 3).map((rem, idx) => {
                    const isLast = idx === Math.min(todaysReminders.length, 3) - 1;
                    const timeStr = new Date(rem.remindAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
                    return (
                      <div key={rem.id} className="flex items-center justify-between gap-3 text-xs relative min-h-[46px]">
                        {/* Left: Time and Icon */}
                        <div className="flex items-center gap-2 text-zinc-400 font-mono w-[68px] shrink-0">
                          <CalendarCheck className="h-4 w-4 opacity-75" />
                          <span className="font-semibold">{timeStr}</span>
                        </div>

                        {/* Middle: Timeline Dot and Line */}
                        <div className="relative flex flex-col items-center w-5 shrink-0 self-stretch justify-center">
                          {/* Dot */}
                          <div className="w-2 h-2 rounded-full bg-[#25D366] z-10 shadow-sm shadow-[#25D366]/50" />
                          {/* Line to next item */}
                          {!isLast && (
                            <div className="absolute top-[50%] bottom-[-26px] w-[1.5px] bg-[#25D366]/35 z-0" />
                          )}
                        </div>

                        {/* Right: Title, Desc, and Checkmark */}
                        <div className="flex-1 min-w-0 pl-1">
                          <p className="font-bold text-white leading-tight truncate">{rem.title}</p>
                          <p className="text-[10px] text-zinc-550 mt-0.5 truncate leading-tight text-zinc-400">Pengingat otomatis WhatsApp</p>
                        </div>

                        {/* Far Right: Checkmark */}
                        <div className="shrink-0 flex items-center justify-center pl-2">
                          <CheckCircle2 className="h-4.5 w-4.5 text-primary/80" />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-[11px] border border-dashed border-zinc-900 rounded-xl bg-zinc-950/20 text-zinc-500 font-medium">
                    Tidak ada agenda untuk tanggal ini.
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-900/60 text-center">
                <Link href="/dashboard/reminders" className="text-xs text-primary hover:underline font-semibold flex items-center justify-center gap-1">
                  Lihat Semua Agenda <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

          </div>

          {/* TRANSAKSI TERAKHIR CARD (Timeline design just like Today's Agenda, under Today's Agenda card) */}
          <div className="glow-card rounded-2xl bg-zinc-950/40 border border-zinc-900 overflow-hidden flex flex-col">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4.5">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Transaksi Hari Ini</h4>
                <Link 
                  href="/dashboard/finance" 
                  className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline bg-primary/10 border border-primary/20 px-2 py-1 rounded-md"
                >
                  <Plus className="h-3 w-3" /> Tambah
                </Link>
              </div>

              {/* Transactions layout list as a premium vertical timeline */}
              <div className="space-y-4.5 relative pl-1">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.slice(0, 3).map((tx, idx) => {
                    const isLast = idx === Math.min(filteredTransactions.length, 3) - 1;
                    const txTime = new Date(tx.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
                    return (
                      <div key={tx.id} className="flex items-center justify-between gap-3 text-xs relative min-h-[46px]">
                        {/* Left: Time and Icon */}
                        <div className="flex items-center gap-2 text-zinc-400 font-mono w-[68px] shrink-0">
                          {tx.type === 'income' ? <TrendingUp className="h-4 w-4 text-emerald-500/80" /> : <TrendingDown className="h-4 w-4 text-red-400/80" />}
                          <span className="font-semibold">{txTime}</span>
                        </div>

                        {/* Middle: Timeline Dot and Line */}
                        <div className="relative flex flex-col items-center w-5 shrink-0 self-stretch justify-center">
                          {/* Dot (emerald for income, red for expense) */}
                          <div className={`w-2 h-2 rounded-full z-10 shadow-sm ${
                            tx.type === 'income' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-400 shadow-red-400/50'
                          }`} />
                          {/* Line to next item */}
                          {!isLast && (
                            <div className="absolute top-[50%] bottom-[-26px] w-[1.5px] bg-zinc-800 z-0" />
                          )}
                        </div>

                        {/* Right: Title, Desc, and Checkmark */}
                        <div className="flex-1 min-w-0 pl-1">
                          <p className="font-bold text-white leading-tight truncate">{tx.description || 'Transaksi Tanpa Keterangan'}</p>
                          <p className="text-[10px] text-zinc-550 mt-0.5 truncate leading-tight text-zinc-400 capitalize">{tx.category}</p>
                        </div>

                        {/* Far Right: Amount */}
                        <div className="shrink-0 flex items-center justify-center pl-2">
                          <span className={`font-bold font-mono ${
                            tx.type === 'income' ? 'text-emerald-500' : 'text-red-400'
                          }`}>
                            {tx.type === 'income' ? '+' : '-'} {formatCurrency(Math.abs(tx.amount))}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-[11px] border border-dashed border-zinc-900 rounded-xl bg-zinc-950/20 text-zinc-500 font-medium">
                    Tidak ada transaksi untuk tanggal ini.
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-900/60 text-center">
                <Link href="/dashboard/finance" className="text-xs text-primary hover:underline font-semibold flex items-center justify-center gap-1">
                  Lihat Semua Transaksi <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
