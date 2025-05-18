// src/app/export/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Construction } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function ExportPage() {
  const { toast } = useToast();

  const handleExportClick = () => {
    toast({
      title: "Feature Coming Soon!",
      description: "PDF export functionality is currently under development. Stay tuned!",
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-center">
      <div className="flex items-center justify-center mb-4">
        <FileText className="mr-3 h-10 w-10 text-primary" />
        <h1 className="text-3xl font-bold">Export Medical Data</h1>
      </div>
      
      <p className="text-lg text-muted-foreground">
        Securely export your comprehensive medical records as a PDF document for easy sharing with healthcare providers or for your personal records.
      </p>

      <Card className="shadow-lg">
        <CardHeader>
          <Image 
            src="https://placehold.co/600x300.png" 
            alt="PDF Document Icon" 
            width={300} 
            height={150} 
            className="mx-auto rounded-lg mb-4 object-cover"
            data-ai-hint="document data"
          />
          <CardTitle className="text-2xl">Ready to Export?</CardTitle>
          <CardDescription>
            Generate a well-formatted PDF containing your medical history, visit logs, and medication list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" onClick={handleExportClick} className="w-full md:w-auto">
            <Download className="mr-2 h-5 w-5" /> Export to PDF
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 p-6 bg-secondary/50 rounded-lg border border-dashed border-primary/50">
        <div className="flex items-center justify-center text-primary">
          <Construction className="h-8 w-8 mr-3" />
          <h2 className="text-xl font-semibold">Feature Under Development</h2>
        </div>
        <p className="text-muted-foreground mt-2">
          We are working hard to bring you a robust and secure PDF export feature. 
          This will allow you to easily share your health information with doctors or keep a personal copy. 
          Thank you for your patience!
        </p>
      </div>
    </div>
  );
}
