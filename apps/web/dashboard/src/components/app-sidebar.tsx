'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  Clock, 
  Settings, 
  LogOut, 
  User 
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarGroup,
  SidebarGroupContent
} from '@/components/ui/sidebar';

interface UserProfile {
  id: string;
  email: string | null;
  phoneNumber: string;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
}

interface AppSidebarProps {
  profile: UserProfile | null;
  onLogout: () => void;
}

export function AppSidebar({ profile, onLogout }: AppSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { href: '/dashboard/finance', label: 'Keuangan', icon: Wallet },
    { href: '/dashboard/reminders', label: 'Pengingat', icon: Clock },
    { href: '/dashboard/settings', label: 'Pengaturan Bot', icon: Settings },
  ];

  const displayName = profile?.profile?.displayName || profile?.phoneNumber || 'JustBot User';
  const displayEmail = profile?.email || profile?.phoneNumber || '';

  return (
    <Sidebar className="border-r border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
      
      {}
      <SidebarHeader className="p-5 border-b border-zinc-900/60">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center bg-zinc-950 border border-zinc-900 shrink-0">
            <img src="/favicon.png" alt="JustBot" className="h-7 w-7 object-contain" />
          </div>
          <span className="font-bold tracking-tight text-white">JustBot</span>
        </div>
      </SidebarHeader>

      {}
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      render={<Link href={item.href} />}
                      isActive={active}
                      className={`w-full h-10 px-3 rounded-lg flex items-center gap-3 transition-colors ${
                        active 
                          ? 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20' 
                          : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-primary' : 'text-zinc-400'}`} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {}
      <SidebarFooter className="p-5 border-t border-zinc-900/60 flex flex-col gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
            <User className="h-4.5 w-4.5 text-zinc-400" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-zinc-500 truncate">{displayEmail}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 h-10 w-full rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
        >
          <LogOut className="h-4.5 w-4.5 text-zinc-450 shrink-0" />
          <span>Keluar</span>
        </button>
      </SidebarFooter>

    </Sidebar>
  );
}
