// src/components/layout/app-layout.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { ShieldCheck, LayoutDashboard, HeartPulse, Hospital, Pill, FileText, Settings, LogOut, LogIn, UserCircle2, Loader2, Mail, KeyRound } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { useAuth } from '@/contexts/auth-context';
import { EmailPasswordLoginDialog } from '@/components/auth/EmailPasswordLoginDialog';
import { EmailPasswordSignupDialog } from '@/components/auth/EmailPasswordSignupDialog';
import { ProfileEditDialog } from '@/components/auth/ProfileEditDialog';
import { FloatingAIButton } from '@/components/ai/FloatingAIButton';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/medical-history', label: 'Medical History', icon: HeartPulse },
  { href: '/visits', label: 'Visits', icon: Hospital },
  { href: '/medications', label: 'Medications', icon: Pill },
  { href: '/export', label: 'Export PDF', icon: FileText },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  const [isProfileEditDialogOpen, setIsProfileEditDialogOpen] = useState(false); 

  const UserProfileSection = () => {
    if (loading) {
      return (
        <Button variant="ghost" className="flex items-center gap-3 w-full justify-start p-2 group-data-[collapsible=icon]:justify-center" disabled>
          <Loader2 className="h-8 w-8 animate-spin" />
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-sidebar-foreground">Loading...</p>
          </div>
        </Button>
      );
    }

    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 w-full justify-start p-2 group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-8 w-8">
                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User Avatar'} data-ai-hint="user avatar" />}
                <AvatarFallback>
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle2 />}
                </AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden text-left">
                <p className="text-sm font-medium text-sidebar-foreground truncate" title={user.displayName || "User"}>{user.displayName || "User"}</p>
                {user.email && <p className="text-xs text-muted-foreground truncate" title={user.email}>{user.email}</p>}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsProfileEditDialogOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-3 w-full justify-start p-2 group-data-[collapsible=icon]:justify-center"
          >
            <LogIn className="h-6 w-6" />
            <span className="group-data-[collapsible=icon]:hidden text-sm font-medium text-sidebar-foreground">Login / Sign Up</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56">
          <DropdownMenuLabel>Authentication</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={loginWithGoogle}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            <span>Sign in with Google</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsLoginDialogOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Sign in with Email</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsSignupDialogOpen(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            <span>Sign up with Email</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-primary">
              <ShieldCheck className="h-7 w-7" />
              <span>KlinRex</span>
            </Link>
            <SidebarTrigger className="ml-auto md:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-1 p-4">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="justify-start"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border flex-shrink-0">
           <UserProfileSection />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6">
          <SidebarTrigger className="hidden md:flex" />
          <div className="flex-1">
            {/* Potential breadcrumbs or page title */}
          </div>
          <ThemeToggleButton />
        </header>
        <main className="flex-1 overflow-y-auto p-6 relative"> {/* Added relative positioning for FAB context */}
          {children}
          <FloatingAIButton />
        </main>
      </SidebarInset>
      <EmailPasswordLoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
      <EmailPasswordSignupDialog open={isSignupDialogOpen} onOpenChange={setIsSignupDialogOpen} />
      <ProfileEditDialog open={isProfileEditDialogOpen} onOpenChange={setIsProfileEditDialogOpen} />
    </SidebarProvider>
  );
}
