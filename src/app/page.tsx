// src/app/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowRight, Bot, FileText, HeartPulse, Hospital, Pill } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const features = [
    {
      title: "Medical History",
      description: "Log illnesses, allergies, and procedures.",
      icon: HeartPulse,
      href: "/medical-history",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Hospital Visits",
      description: "Record details of your hospital stays and appointments.",
      icon: Hospital,
      href: "/visits",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Medications",
      description: "Track your prescribed medications and dosages.",
      icon: Pill,
      href: "/medications",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "AI Assistant",
      description: "Get help preparing for doctor appointments.",
      icon: Bot,
      href: "/ai-assistant",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Export Data",
      description: "Generate a PDF of your medical records.",
      icon: FileText,
      href: "/export",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Welcome to MediTrack Pro!</CardTitle>
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
            MediTrack Pro helps you keep a comprehensive record of your health, from medical history and hospital visits to medications. 
            Use our AI Assistant to prepare for doctor's appointments and easily export your data when needed.
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/medical-history">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              <div className={`p-2 rounded-full ${feature.bgColor}`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
              <Button variant="outline" size="sm" asChild className="mt-4">
                <Link href={feature.href}>
                  Go to {feature.title} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
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
            MediTrack Pro is designed to make this process simple and secure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
