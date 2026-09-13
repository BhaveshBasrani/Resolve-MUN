'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050714] text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-400/30 border-t-blue-500 animate-spin" />
        <p className="text-sm text-white/60 font-medium">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
}
