// src/app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity, ArrowRight, FileText, HeartPulse, Hospital, Pill, ClipboardPlus, Stethoscope, BriefcaseMedical } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // Intro screen duration: 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden intro-fade-out">
        <h1 className="text-7xl md:text-8xl font-bold text-primary animate-pulse mb-8">Medrec</h1>
        
        {/* Floating Icons */}
        <Hospital className="absolute text-blue-500/70" style={{ top: '10%', left: '15%', width: '50px', height: '50px', animation: 'float1 20s ease-in-out infinite' }} />
        <Stethoscope className="absolute text-green-500/70" style={{ top: '20%', right: '10%', width: '45px', height: '45px', animation: 'float2 18s ease-in-out infinite' }} />
        <HeartPulse className="absolute text-red-500/70" style={{ bottom: '15%', left: '20%', width: '50px', height: '50px', animation: 'float3 22s ease-in-out infinite' }} />
        <ClipboardPlus className="absolute text-purple-500/70" style={{ bottom: '25%', right: '18%', width: '55px', height: '55px', animation: 'float4 19s ease-in-out infinite' }} />
        <BriefcaseMedical className="absolute text-yellow-500/70" style={{ top: '50%', left: '5%', width: '45px', height: '45px', animation: 'float1 17s ease-in-out infinite reverse' }} />
        <Activity className="absolute text-indigo-500/70" style={{ top: '65%', right: '8%', width: '50px', height: '50px', animation: 'float2 21s ease-in-out infinite reverse' }} />
        <Pill className="absolute text-pink-500/70" style={{ top: '30%', left: '40%', width: '40px', height: '40px', animation: 'float3 16s ease-in-out infinite' }} />
        <FileText className="absolute text-teal-500/70" style={{ bottom: '10%', right: '35%', width: '45px', height: '45px', animation: 'float4 23s ease-in-out infinite reverse' }} />

        <p className="absolute bottom-10 text-sm text-muted-foreground">Loading your health dashboard...</p>
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
              <CardTitle className="text-3xl font-bold text-primary">Welcome to Medrec!</CardTitle>
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
            Medrec helps you keep a comprehensive record of your health, from medical history and hospital visits to medications. 
            Use our AI Assistant (via the floating button) to prepare for doctor's appointments and easily export your data when needed.
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/medical-history">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"> {/* Adjusted grid for better responsiveness */}
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
            Medrec is designed to make this process simple and secure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
