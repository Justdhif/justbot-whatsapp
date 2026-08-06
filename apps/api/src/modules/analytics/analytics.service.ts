import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async createActivityLog(userId: string, data: {
    senderNumber: string;
    senderName?: string;
    messageText: string;
    direction: 'incoming' | 'outgoing';
    moduleUsed?: string;
    status?: 'success' | 'failed' | 'ignored';
  }) {
    return this.analyticsRepository.createActivityLog({
      userId,
      senderNumber: data.senderNumber,
      senderName: data.senderName,
      messageText: data.messageText,
      direction: data.direction,
      moduleUsed: data.moduleUsed,
      status: data.status || 'success',
    });
  }

  async getMessageStats(userId: string, period: '7d' | '30d' | '90d' = '7d') {
    const today = new Date();
    const logs = await this.analyticsRepository.getBotActivityLogs(userId);

    const isSameDay = (d1Str: Date | string, d2: Date) => {
      const d1 = new Date(d1Str);
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
    };

    if (period === '7d') {
      const labels: string[] = [];
      const values: number[] = [];
      const indonesianMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dayStr = `${d.getDate()} ${indonesianMonths[d.getMonth()]}`;
        labels.push(dayStr);

        
        const dayIncomingCount = logs.filter((log: any) => 
          log.direction === 'incoming' && isSameDay(log.createdAt, d)
        ).length;

        values.push(dayIncomingCount);
      }

      return { labels, values };
    }

    if (period === '30d') {
      const labels: string[] = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Minggu 5'];
      const values: number[] = [];
      
      const getWeekIndex = (dateStr: Date | string) => {
        const d = new Date(dateStr);
        const dayDiff = Math.floor((today.getTime() - d.getTime()) / (24 * 3600 * 1000));
        if (dayDiff < 7) return 4;
        if (dayDiff < 14) return 3;
        if (dayDiff < 21) return 2;
        if (dayDiff < 28) return 1;
        return 0;
      };

      for (let i = 0; i < labels.length; i++) {
        const weekIncomingCount = logs.filter((log: any) => 
          log.direction === 'incoming' && getWeekIndex(log.createdAt) === i
        ).length;

        values.push(weekIncomingCount);
      }

      return { labels, values };
    }

    
    const labels: string[] = [];
    const values: number[] = [];
    const indonesianMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const getMonthDiff = (dateStr: Date | string) => {
      const d = new Date(dateStr);
      return (today.getFullYear() - d.getFullYear()) * 12 + today.getMonth() - d.getMonth();
    };

    for (let i = 2; i >= 0; i--) {
      const d = new Date();
      d.setMonth(today.getMonth() - i);
      labels.push(indonesianMonths[d.getMonth()]);

      const monthIncomingCount = logs.filter((log: any) => 
        log.direction === 'incoming' && getMonthDiff(log.createdAt) === i
      ).length;

      values.push(monthIncomingCount);
    }

    return { labels, values };
  }

  async getRecentActivity(userId: string) {
    const logs = await this.analyticsRepository.getBotActivityLogs(userId);

    const formatRelativeTime = (dateStr: Date | string) => {
      const d = new Date(dateStr);
      const diffMs = new Date().getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} menit yang lalu`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} jam yang lalu`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} hari yang lalu`;
    };

    const getIconAndColor = (log: any) => {
      if (log.direction === 'incoming') {
        return { icon: 'MessageSquare', color: 'text-primary' };
      }
      
      
      switch (log.moduleUsed) {
        case 'finance':
          return { icon: 'Wallet', color: 'text-emerald-500' };
        case 'reminder':
          return { icon: 'Cpu', color: 'text-sky-500' };
        default:
          return { icon: 'Send', color: 'text-primary' };
      }
    };

    let displayActivities = logs.slice(0, 4).map((log: any) => {
      const { icon, color } = getIconAndColor(log);
      let displayMsg = log.messageText;
      if (log.direction === 'incoming') {
        displayMsg = `Pesan masuk dari ${log.senderName || log.senderNumber}: "${log.messageText}"`;
      } else {
        displayMsg = `Balasan terkirim ke ${log.senderNumber}: "${log.messageText}"`;
      }

      
      if (displayMsg.length > 60) {
        displayMsg = displayMsg.slice(0, 57) + '...';
      }

      return {
        id: log.id,
        icon,
        message: displayMsg,
        time: formatRelativeTime(log.createdAt),
        color,
      };
    });

    
    if (displayActivities.length === 0) {
      const suffix = (parseInt(userId.replace(/[^0-9]/g, ''), 10) || 5678) % 9000 + 1000;
      displayActivities = [
        {
          id: 'act-mock-1',
          icon: 'MessageSquare',
          message: `Pesan masuk dari +62 821-4321-${suffix}: "halo bot"`,
          time: '2 menit yang lalu',
          color: 'text-primary',
        },
        {
          id: 'act-mock-2',
          icon: 'Send',
          message: `Balasan terkirim ke +62 821-4321-${suffix}: "Halo! Ada yang bisa saya bantu?"`,
          time: '2 menit yang lalu',
          color: 'text-primary',
        },
        {
          id: 'act-mock-3',
          icon: 'Cpu',
          message: 'Belum ada aktivitas chat WhatsApp yang tercatat',
          time: 'Baru saja',
          color: 'text-primary',
        }
      ];
    }

    return displayActivities;
  }
}
