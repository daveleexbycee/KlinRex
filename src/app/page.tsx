// src/app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, HeartPulse } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

export default function LandingPage() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  return (
    <div className="flex-1 w-full">
      <section className="container grid lg:grid-cols-2 gap-12 items-center py-12 md:py-24">
        <div className="flex flex-col items-start space-y-6">
          <span className="text-primary font-semibold tracking-wider uppercase text-sm">
            PERSONAL HEALTH APP
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold !leading-tight text-foreground">
            A modern way <br />
            to track your health
          </h1>
          <p className="text-muted-foreground text-lg max-w-prose">
            KlinRex is a free mobile-friendly app to manage medication plans, log health data, track symptoms, and share information with doctors for remote consultations.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button size="lg" asChild>
              <Link href="/medical-history">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {installPrompt && (
              <Button size="lg" variant="outline" onClick={handleInstallClick}>
                <Download className="mr-2 h-5 w-5" />
                Install App
              </Button>
            )}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl -z-10"></div>
            <Image
                src="https://placehold.co/800x600.png"
                alt="A person using the KlinRex app on their phone"
                width={800}
                height={600}
                className="rounded-3xl shadow-2xl object-cover"
                data-ai-hint="family using health app"
                priority
            />
        </div>
      </section>
    </div>
  );
}
