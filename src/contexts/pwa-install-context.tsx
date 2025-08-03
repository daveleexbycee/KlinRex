// src/contexts/pwa-install-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// TypeScript interface for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallContextType {
  installPrompt: BeforeInstallPromptEvent | null;
  triggerInstall: () => void;
}

const PWAInstallContext = createContext<PWAInstallContextType | undefined>(undefined);

export const PWAInstallProvider = ({ children }: { children: ReactNode }) => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstall = () => {
    if (!installPrompt) {
        toast({
            title: "App Already Installed or Not Supported",
            description: "You may have already installed the app, or your browser doesn't support this feature.",
            variant: "default"
        });
        return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        toast({ title: "Success!", description: "KlinRex has been installed." });
      } else {
        // Silently handle dismissal, no need to toast
      }
      setInstallPrompt(null); // Clear the prompt after it's been used
    });
  };

  return (
    <PWAInstallContext.Provider value={{ installPrompt, triggerInstall }}>
      {children}
    </PWAInstallContext.Provider>
  );
};

export const usePWAInstall = (): PWAInstallContextType => {
  const context = useContext(PWAInstallContext);
  if (context === undefined) {
    throw new Error('usePWAInstall must be used within a PWAInstallProvider');
  }
  return context;
};
