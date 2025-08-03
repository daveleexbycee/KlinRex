// src/components/layout/bottom-nav-bar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon | (({ className }: { className?: string | undefined }) => JSX.Element);
}

interface BottomNavBarProps {
  navItems: NavItem[];
}

export function BottomNavBar({ navItems }: BottomNavBarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm">
      <div 
        className="mx-auto flex h-16 max-w-md items-center justify-around"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} passHref legacyBehavior>
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "flex h-full w-full flex-col items-center justify-center gap-1 rounded-none text-xs",
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <a>
                  <Icon className="h-6 w-6" />
                  <span>{label}</span>
                </a>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
