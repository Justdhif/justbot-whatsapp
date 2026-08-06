'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getAuthTokens } from '@/lib/api-client';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const { accessToken, refreshToken } = getAuthTokens();
    if (accessToken || refreshToken) {
      router.push('/dashboard');
    } else {
      router.push('/register');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 text-zinc-600 animate-spin" />
      <p className="text-zinc-600 text-xs mt-3 font-mono">Redirecting...</p>
    </div>
  );
}
