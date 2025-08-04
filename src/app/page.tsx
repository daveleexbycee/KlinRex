// src/app/page.tsx
"use client";

import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePWAInstall } from '@/contexts/pwa-install-context';
import { useAuth } from '@/contexts/auth-context';
import Script from 'next/script';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  const { installPrompt, triggerInstall } = usePWAInstall();
  const { user } = useAuth();

  const handleInstallClick = () => {
    triggerInstall();
  };
  
  useEffect(() => {
    const adSlot = document.querySelector('.adsbygoogle');
    
    // Check if the ad slot has already been filled by AdSense.
    // AdSense adds a 'data-ad-status="filled"' attribute to the <ins> tag.
    if (adSlot && !adSlot.hasAttribute('data-ad-status')) {
        try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }
  }, []);


  return (
    <div className="flex-1 w-full">
       <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3338207509752884"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <section className="container grid lg:grid-cols-2 gap-12 items-center py-12 md:py-24">
        <div className="flex flex-col items-start space-y-6">
          <span className="text-primary font-semibold tracking-wider uppercase text-sm">
            PERSONAL HEALTH SITE
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold !leading-tight text-foreground">
            A modern way <br />
            to track your health
          </h1>
          <p className="text-muted-foreground text-lg max-w-prose">
            KlinRex is a free mobile-friendly app to manage medication plans, log health data, track symptoms, and export(pdf) your info to doctors.
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

      <section className="container py-12">
          <Card>
              <CardContent className="p-4 md:p-6">
                  <ins className="adsbygoogle"
                      style={{ display: 'block' }}
                      data-ad-client="ca-pub-3338207509752884"
                      data-ad-slot="3496010343"
                      data-ad-format="auto"
                      data-full-width-responsive="true"></ins>
              </CardContent>
          </Card>
      </section>
    </div>
  );
}
