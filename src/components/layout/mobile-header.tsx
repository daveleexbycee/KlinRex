// src/components/layout/mobile-header.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HeartPulse, Menu, Settings, LogOut, FileText, UserCircle2, Loader2, KeyRound, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { EmailPasswordLoginDialog } from '@/components/auth/EmailPasswordLoginDialog';
import { EmailPasswordSignupDialog } from '@/components/auth/EmailPasswordSignupDialog';
import { ProfileEditDialog } from '@/components/auth/ProfileEditDialog';

export function MobileHeader() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  const [isProfileEditDialogOpen, setIsProfileEditDialogOpen] = useState(false);

  const handleLogout = async () => {
    setIsSheetOpen(false);
    await logout();
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsSheetOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <HeartPulse className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg">KlinRex</span>
          </Link>
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] max-w-xs p-0">
              <div className="flex h-full flex-col">
                <div className="p-4 border-b">
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : user ? (
                     <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User Avatar'} />}
                          <AvatarFallback>
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle2 />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                           <span className="font-semibold truncate">{user.displayName || 'User'}</span>
                           <span className="text-sm text-muted-foreground truncate">{user.email}</span>
                        </div>
                      </div>
                  ) : (
                    <span className="font-semibold text-lg">Menu</span>
                  )}
                </div>

                <nav className="flex-1 space-y-2 p-4">
                   <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => handleNavigation('/export')}>
                      <FileText /> Export Data
                   </Button>
                   {user && (
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setIsProfileEditDialogOpen(true); setIsSheetOpen(false); }}>
                        <Settings /> Profile Settings
                    </Button>
                   )}
                   <div className="!mt-4 p-2 flex items-center justify-between rounded-md hover:bg-accent">
                        <span className="text-sm font-medium">Theme</span>
                        <ThemeToggleButton />
                   </div>
                </nav>

                <div className="p-4 border-t">
                  {user ? (
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                      <LogOut /> Log Out
                    </Button>
                  ) : (
                    <div className="space-y-2">
                        <Button className="w-full justify-start gap-2" onClick={() => { setIsLoginDialogOpen(true); setIsSheetOpen(false);}}>
                           <Mail /> Sign In
                        </Button>
                         <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => { setIsSignupDialogOpen(true); setIsSheetOpen(false);}}>
                           <KeyRound /> Sign Up
                        </Button>
                    </div>
                  )}
                </div>

              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <EmailPasswordLoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
      <EmailPasswordSignupDialog open={isSignupDialogOpen} onOpenChange={setIsSignupDialogOpen} />
      <ProfileEditDialog open={isProfileEditDialogOpen} onOpenChange={setIsProfileEditDialogOpen} />
    </>
  );
}
