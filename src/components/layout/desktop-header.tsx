// src/components/layout/desktop-header.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { HeartPulse, Settings, LogOut, UserCircle2, Loader2, FileText, LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { EmailPasswordLoginDialog } from '@/components/auth/EmailPasswordLoginDialog';
import { EmailPasswordSignupDialog } from '@/components/auth/EmailPasswordSignupDialog';
import { ProfileEditDialog } from '@/components/auth/ProfileEditDialog';
import { ThemeToggleButton } from '@/components/theme-toggle-button';

const navItems = [
  { href: '/medical-history', label: 'Medical History' },
  { href: '/visits', label: 'Visits' },
  { href: '/medications', label: 'Medications' },
  { href: '/ai-assistant', label: 'AI Assistant' },
  { href: '/export', label: 'Export' },
];

export function DesktopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  const [isProfileEditDialogOpen, setIsProfileEditDialogOpen] = useState(false);

  const UserProfileSection = () => {
    if (loading) {
      return <Loader2 className="h-6 w-6 animate-spin" />;
    }

    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User Avatar'} data-ai-hint="user avatar"/>}
                <AvatarFallback>
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle2 />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate" title={user.displayName || "User"}>{user.displayName || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground truncate" title={user.email || ""}>{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
             <DropdownMenuItem onSelect={() => router.push('/')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsProfileEditDialogOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex justify-between items-center">
              <div className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Theme</span>
              </div>
              <ThemeToggleButton />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => setIsLoginDialogOpen(true)}>
          Sign In
        </Button>
        <Button onClick={() => setIsSignupDialogOpen(true)}>
          Sign Up
        </Button>
      </div>
    );
  };
  
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <div className="mr-auto flex items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
                <HeartPulse className="h-7 w-7 text-primary" />
                <span className="font-bold text-lg">KlinRex</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center justify-end">
             <div className="hidden md:flex">
                <UserProfileSection />
            </div>
          </div>
        </div>
      </header>
       <EmailPasswordLoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
       <EmailPasswordSignupDialog open={isSignupDialogOpen} onOpenChange={setIsSignupDialogOpen} />
       <ProfileEditDialog open={isProfileEditDialogOpen} onOpenChange={setIsProfileEditDialogOpen} />
    </>
  );
}
