// src/app/page.tsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, HeartPulse } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePWAInstall } from '@/contexts/pwa-install-context';
import { useAuth } from '@/contexts/auth-context';

export default function LandingPage() {
  const { installPrompt, triggerInstall } = usePWAInstall();
  const { user } = useAuth();

  const handleInstallClick = () => {
    triggerInstall();
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
            {!user && installPrompt && (
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
                src="https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxtZWRpY2Fsc3xlbnwwfHx8fDE3NTQyMTEzMjN8MA&ixlib=rb-4.1.0&q=80&w=1080"
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
