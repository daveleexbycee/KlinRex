// src/app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity, ArrowRight, FileText, HeartPulse, Hospital, Pill, BriefcaseMedical } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Greek letters for the intro animation
const GREEK_LETTERS = ['Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ'];

export default function DashboardPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [introStage, setIntroStage] = useState(1); // 1 for "Ιατρικά Αρχεία", 2 for "KlinRex"

  useEffect(() => {
    const introTimer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // Total intro screen duration

    const stageTimer = setTimeout(() => {
      setIntroStage(2);
    }, 1800); // Switch text after 1.8 seconds

    return () => {
      clearTimeout(introTimer);
      clearTimeout(stageTimer);
    };
  }, []);

  if (showIntro) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden intro-screen-klinrex intro-fade-out">
        {/* Animated Waves */}
        <div className="intro-wave intro-wave1"></div>
        <div className="intro-wave intro-wave2"></div>
        <div className="intro-wave intro-wave3"></div>

        {/* Greek Letters */}
        {GREEK_LETTERS.map((letter, index) => (
          <span
            key={index}
            className="intro-greek-letter"
            style={{
              animationDelay: `${index * 0.3}s`,
              left: `${Math.random() * 80 + 10}%`, // Random horizontal position
              top: `${Math.random() * 80 + 10}%`,   // Random vertical position
              fontSize: `${Math.random() * 1.5 + 1}rem`, // Random size
            }}
          >
            {letter}
          </span>
        ))}

        {/* Centerpiece Logo */}
        <div className="intro-centerpiece-logo">
          <h1
            className={`intro-logo-text ${introStage === 1 ? 'intro-logo-text-visible' : 'intro-logo-text-hidden'}`}
          >
            Ιατρικά Αρχεία
          </h1>
          <h1
            className={`intro-logo-text ${introStage === 2 ? 'intro-logo-text-visible' : 'intro-logo-text-hidden'}`}
          >
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
            Use our AI Assistant (via the floating button) to prepare for doctor's appointments and easily export your data when needed.
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
