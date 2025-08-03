// src/components/layout/app-layout.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeartPulse, LayoutDashboard, Hospital, Pill, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { MedicalConnectionIcon } from '@/components/ai/FloatingAIButton';
import { usePwa } from '@/hooks/use-pwa';
import { BottomNavBar } from './bottom-nav-bar';
import { DesktopHeader } from './desktop-header';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/medical-history', label: 'Medical History', icon: HeartPulse },
  { href: '/visits', label: 'Visits', icon: Hospital },
  { href: '/medications', label: 'Medications', icon: Pill },
  { href: '/ai-assistant', label: 'AI Assistant', icon: MedicalConnectionIcon },
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
        <div className="flex flex-col h-screen">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
             <div className="container flex h-16 items-center"></div>
          </header>
          <main className="flex-1"></main>
        </div>
    );
  }

  return (
    <>
      {isPwa ? (
        <>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
            </main>
            <BottomNavBar navItems={navItems} />
        </>
      ) : (
        <div className="flex flex-col min-h-screen">
            <DesktopHeader />
            <main className="flex-1 container py-6 md:py-8">
                {children}
            </main>
        </div>
      )}
    </>
  );
}
