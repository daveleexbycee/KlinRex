// src/components/layout/app-layout.tsx
"use client";

import React, { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { usePwa } from '@/hooks/use-pwa';
import { BottomNavBar } from './bottom-nav-bar';
import { DesktopHeader } from './desktop-header';
import { MobileHeader } from './mobile-header'; // Import the new mobile header
import { MedicalConnectionIcon } from '@/components/ai/FloatingAIButton';
import { HeartPulse, LayoutDashboard, Hospital, Pill } from 'lucide-react';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/medical-history', label: 'Medicals', icon: HeartPulse },
  { href: '/visits', label: 'Visits', icon: Hospital },
  { href: '/medications', label: 'Meds', icon: Pill },
  { href: '/ai-assistant', label: 'AI', icon: MedicalConnectionIcon },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isPwa = usePwa();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isPwa) {
      document.body.classList.add('pwa-body-padding');
    } else {
      document.body.classList.remove('pwa-body-padding');
    }
  }, [isPwa]);

  if (!isClient) {
    // Render a skeleton or loader to avoid layout shifts and hydration errors
    return (
        <div className="flex flex-col h-screen items-center justify-center bg-background">
          <HeartPulse className="h-20 w-20 text-primary animate-heart-pulse" />
        </div>
    );
  }

  return (
    <>
      {isPwa ? (
        <>
            <MobileHeader /> 
            <main className="flex-1 p-4 md:p-6 lg:p-8 pt-20">
                {children}
            </main>
            <BottomNavBar navItems={navItems} />
        </>
      ) : (
        <div className="flex flex-col min-h-screen">
            <DesktopHeader />
            <main className="flex-1 container py-6 md:py-8 px-4 md:px-8">
                {children}
            </main>
        </div>
      )}
    </>
  );
}
