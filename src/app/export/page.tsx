// src/app/export/page.tsx
"use client";

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, UserCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { PrintableMedicalReport } from '@/components/export/PrintableMedicalReport';
import type { MedicalHistoryItem, VisitItem, MedicationItem } from '@/types';

// Import PDF generation libraries
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Sample Data for PDF Demonstration ---
// In a real application, this data would be fetched from a backend or state management solution.
const sampleMedicalHistory: MedicalHistoryItem[] = [
  { id: 'mh1', type: 'Illness', description: 'Seasonal Influenza (Flu)', date: '2023-01-15', notes: 'Managed with rest, fluids, and oseltamivir. Full recovery.' },
  { id: 'mh2', type: 'Allergy', description: 'Penicillin', date: '2010-05-20', notes: 'Causes severe skin rash (urticaria) and mild breathing difficulty. Marked as critical allergy.' },
  { id: 'mh3', type: 'Procedure', description: 'Appendectomy', date: '2005-08-22', notes: 'Laparoscopic appendectomy due to acute appendicitis. No complications.' },
];
const sampleVisits: VisitItem[] = [
  { id: 'v1', date: '2023-06-10', hospitalName: 'City General Hospital', doctorName: 'Dr. Emily White (Cardiologist)', sicknessType: 'Annual Checkup & BP Follow-up', details: 'Routine examination. Blood pressure stable. ECG normal. Advised continued medication and lifestyle management.' },
  { id: 'v2', date: '2023-03-01', hospitalName: 'Downtown Urgent Care', doctorName: 'Dr. John Davis', sicknessType: 'Sprained Ankle', details: 'Fell during sports. X-ray confirmed moderate sprain. RICE protocol advised. Prescribed pain relief.' },
];
const sampleMedications: MedicationItem[] = [
  { id: 'm1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily in the morning', reason: 'Hypertension (High Blood Pressure)', startDate: '2022-01-01' },
  { id: 'm2', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily in the evening', reason: 'Hyperlipidemia (High Cholesterol)', startDate: '2022-01-01' },
  { id: 'm3', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', reason: 'Type 2 Diabetes', startDate: '2021-07-15', endDate: '2023-02-28' },
];
// --- End Sample Data ---


export default function ExportPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printableReportRef = useRef<HTMLDivElement>(null);

  const handleExportClick = async () => {
    if (!user && !authLoading) {
      toast({
        title: "Authentication Required",
        description: "Please log in to export your medical data.",
        variant: "destructive",
      });
      return;
    }

    if (!printableReportRef.current) {
        toast({ title: "Error", description: "Report content not found.", variant: "destructive" });
        return;
    }
    
    setIsGeneratingPdf(true);
    toast({ title: "Generating PDF...", description: "Please wait while your report is being prepared." });

    try {
      const element = printableReportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Increase scale for better quality
        useCORS: true,
        logging: false, // Disable html2canvas console logs
        // Ensure background is captured, especially if it's white by default from component
        backgroundColor: '#ffffff', 
        onclone: (document) => {
          // This can be used to modify the cloned document before rendering, if needed
          // For example, force certain styles or remove elements not wanted in PDF
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt', // points, A4 is roughly 595pt x 842pt
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate the aspect ratio of the image
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = imgProps.width;
      const imgHeight = imgProps.height;
      
      // Calculate the ratio to fit the image within the PDF page dimensions
      // while maintaining aspect ratio
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const finalImgWidth = imgWidth * ratio;
      const finalImgHeight = imgHeight * ratio;

      // Add image to PDF (centered)
      const xOffset = (pdfWidth - finalImgWidth) / 2;
      const yOffset = (pdfHeight - finalImgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalImgWidth, finalImgHeight);
      
      const userNameForFile = user?.displayName?.replace(/\s+/g, '_') || 'User';
      pdf.save(`KlinRex_Report_${userNameForFile}.pdf`);

      toast({ title: "Success!", description: "Your PDF report has been downloaded." });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "An error occurred while generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const userName = user?.displayName || "your";
  const isLoading = authLoading || isGeneratingPdf;

  return (
    <>
      {/* This component is rendered for html2canvas to capture, but hidden from normal view */}
      <div className="absolute -left-full top-0 opacity-0 pointer-events-none" aria-hidden="true">
          <PrintableMedicalReport
            ref={printableReportRef}
            user={user}
            medicalHistory={sampleMedicalHistory} // Replace with actual data
            visits={sampleVisits}                 // Replace with actual data
            medications={sampleMedications}       // Replace with actual data
          />
      </div>

      <div className="space-y-6 max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center mb-4">
          <FileText className="mr-3 h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold">Export Medical Data</h1>
        </div>
        
        <p className="text-lg text-muted-foreground">
          Securely export {userName} comprehensive medical records as a PDF document. This document will feature {user?.displayName ? <strong>{user.displayName}</strong> : "your name"} for easy sharing with healthcare providers or for personal records.
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-md border border-amber-300 dark:border-amber-700">
          <strong>Note:</strong> The PDF currently uses sample data for demonstration. Integrating your live medical history, visits, and medication data is a planned feature.
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
            <CardTitle className="text-2xl">
              Ready to Export{user?.displayName ? `, ${user.displayName.split(' ')[0]}?` : "?"}
            </CardTitle>
            <CardDescription>
              Generate a well-formatted PDF containing {userName} medical history, visit logs, and medication list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={handleExportClick} className="w-full md:w-auto" disabled={isLoading}>
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating PDF...
                </>
              ) : authLoading ? (
                <>
                  <UserCircle2 className="mr-2 h-5 w-5 animate-pulse" /> Loading User Info...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" /> Export to PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
