'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { apiFetch, clearAuthTokens, getAuthTokens } from '@/lib/api-client';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

interface UserProfile {
  id: string;
  email: string | null;
  phoneNumber: string;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Authenticate and load profile
  useEffect(() => {
    const checkAuth = async () => {
      const { accessToken, refreshToken } = getAuthTokens();
      if (!accessToken && !refreshToken) {
        router.push('/register');
        return;
      }
      
      try {
        const response = await apiFetch<UserProfile>('/users/me');
        // Handle wrapper response structure
        const payload = (response as any).data || response;
        setProfile(payload);
      } catch (err) {
        console.error('Fetch profile error, redirecting to register:', err);
        clearAuthTokens();
        router.push('/register');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      clearAuthTokens();
      router.push('/register');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-zinc-500 text-sm mt-3">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <SidebarProvider className="bg-black text-zinc-100 min-h-screen">
      {/* App Sidebar from Shadcn */}
      <AppSidebar profile={profile} onLogout={handleLogout} />
      
      {/* Main Content Area */}
      <SidebarInset className="flex-1 flex flex-col bg-black min-w-0">
        
        {/* Header toolbar for Mobile & Sidebar Toggle */}
        <header className="flex h-14 items-center gap-4 border-b border-zinc-900 bg-zinc-950 px-4 md:px-6 sticky top-0 z-30 w-full shrink-0">
          <SidebarTrigger className="text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 w-8 rounded-lg transition-colors cursor-pointer" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-white">JustBot Console</span>
          </div>
        </header>
        
        {/* Children Pages viewport */}
        <div className="flex-1 p-4 md:p-6 w-full mx-auto overflow-y-auto">
          {children}
        </div>
        
      </SidebarInset>
    </SidebarProvider>
  );
}
