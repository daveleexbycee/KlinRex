// src/app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity, ArrowRight, FileText, HeartPulse, Hospital, Pill, BriefcaseMedical, Stethoscope, FlaskConical, Download, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Medical icons for the intro animation
const MEDICAL_ICONS = [
  { Icon: HeartPulse, key: 'heart' },
  { Icon: Stethoscope, key: 'stethoscope' },
  { Icon: Pill, key: 'pill' },
  { Icon: Hospital, key: 'hospital' },
  { Icon: BriefcaseMedical, key: 'briefcase' },
  { Icon: FlaskConical, key: 'flask' },
];

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}


export default function DashboardPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setIsClient(true); // Component has mounted on the client

    const introTimer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // Total intro screen duration

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(introTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
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

  if (showIntro) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden intro-screen-klinrex intro-fade-out">
        {/* Floating Medical Icons - Render only on client-side */}
        {isClient && MEDICAL_ICONS.map(({ Icon, key }, index) => (
          <span
            key={key}
            className="intro-medical-icon"
            style={{
              animationDelay: `${index * 0.4}s`, // Stagger animation
              left: `${Math.random() * 85 + 7.5}%`, // Random horizontal position
              top: `${Math.random() * 85 + 7.5}%`,   // Random vertical position
              fontSize: `${Math.random() * 1.2 + 1.3}rem`, // Random size
              opacity: Math.random() * 0.3 + 0.2, // Random opacity
            }}
          >
            <Icon className="h-full w-full" />
          </span>
        ))}

        {/* Centerpiece Logo */}
        <div className="intro-centerpiece-logo">
          <h1 className="intro-logo-text intro-logo-text-visible">
            KlinRex
          </h1>
        </div>
        
        <p className="absolute bottom-10 text-sm text-white/70 font-light">Loading your health dashboard...</p>
      </div>
    );
  }

  // Original DashboardPage content
  const features = [
    {
      title: "Medical History",
      description: "Log illnesses, allergies, and procedures.",
      icon: HeartPulse,
      href: "/medical-history",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      title: "Hospital Visits",
      description: "Record details of your hospital stays and appointments.",
      icon: Hospital,
      href: "/visits",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      title: "Medications",
      description: "Track your prescribed medications and dosages.",
      icon: Pill,
      href: "/medications",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      title: "Export Data",
      description: "Generate a PDF of your medical records.",
      icon: FileText,
      href: "/export",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/30 dark:text-red-400",
    },
  ];

  return (
    <div className="space-y-8">
      <Card className="shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2">
            <div className="p-8 flex flex-col justify-center">
              <CardTitle className="text-3xl font-bold">Welcome to KlinRex</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2">
                Your personal, secure health organizer.
              </CardDescription>
              <p className="text-foreground mt-4">
                KlinRex helps you keep a comprehensive record of your health. Use our AI to get insights, and easily export your data when needed.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <Button asChild size="lg">
                  <Link href="/medical-history">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                {installPrompt && (
                  <Button onClick={handleInstallClick} size="lg" variant="outline">
                    <Download className="mr-2 h-5 w-5" />
                    Install App
                  </Button>
                )}
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center bg-primary/5 p-8">
                <ShieldCheck className="w-32 h-32 text-primary/80" strokeWidth={1}/>
            </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
               <div className={`p-2 rounded-full bg-secondary`}>
                <feature.icon className={`h-6 w-6 text-secondary-foreground`} />
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild className="mt-auto">
                <Link href={feature.href}>
                  Go to {feature.title} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-6 w-6 text-primary" />
            Stay Informed
          </CardTitle>
          <CardDescription>
            Keep your records up-to-date for the best healthcare experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">
            Regularly updating your medical information ensures you and your healthcare providers have the most accurate data, leading to better diagnoses and treatment plans. 
            KlinRex is designed to make this process simple and secure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
