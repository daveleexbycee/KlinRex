// src/app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity, ArrowRight, FileText, HeartPulse, Hospital, Pill, BriefcaseMedical, Stethoscope, FlaskConical } from "lucide-react"; // Added more medical icons
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

export default function DashboardPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Component has mounted on the client

    const introTimer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // Total intro screen duration

    return () => {
      clearTimeout(introTimer);
    };
  }, []);

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
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Welcome to KlinRex!</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">
                Your personal health organizer. Manage your medical journey with ease.
              </CardDescription>
            </div>
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Healthcare illustration" 
              width={200} 
              height={133} 
              className="rounded-lg object-cover"
              data-ai-hint="healthcare illustration"
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">
            KlinRex helps you keep a comprehensive record of your health, from medical history and hospital visits to medications. 
            Use our KlinRex AI (via the floating button) to get health insights and easily export your data when needed.
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/medical-history">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              <div className={`p-2 rounded-full ${feature.bgColor}`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
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
