// src/app/export/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, UserCircle2, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { PrintableMedicalReport } from '@/components/export/PrintableMedicalReport';
import type { MedicalHistoryItem, VisitItem, MedicationItem } from '@/types';
import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Helper to convert Firestore Timestamps to YYYY-MM-DD date strings or return as is
const firestoreDateToString = (dateValue: any): string | undefined => {
  if (!dateValue) return undefined;
  if (dateValue instanceof Timestamp) {
    return dateValue.toDate().toISOString().split('T')[0];
  }
  if (typeof dateValue === 'string') { // Already a string
    return dateValue;
  }
  // If it's a Date object already (e.g. from form state before saving to FS)
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split('T')[0];
  }
  return undefined; // Or handle as an error
};


export default function ExportPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printableReportRef = useRef<HTMLDivElement>(null);

  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryItem[]>([]);
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchDataForPdf = useCallback(async () => {
    if (!user) {
      setMedicalHistory([]);
      setVisits([]);
      setMedications([]);
      setIsFetchingData(false);
      return;
    }

    setIsFetchingData(true);
    setFetchError(null);
    try {
      const historyCollectionRef = collection(db, "users", user.uid, "medicalHistory");
      const historyQuery = query(historyCollectionRef, orderBy("date", "desc"));
      const historySnapshot = await getDocs(historyQuery);
      setMedicalHistory(historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: firestoreDateToString(doc.data().date),
      } as MedicalHistoryItem)));

      const visitsCollectionRef = collection(db, "users", user.uid, "visits");
      const visitsQuery = query(visitsCollectionRef, orderBy("date", "desc"));
      const visitsSnapshot = await getDocs(visitsQuery);
      setVisits(visitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: firestoreDateToString(doc.data().date)!, // Date is required for visits
      } as VisitItem)));

      const medicationsCollectionRef = collection(db, "users", user.uid, "medications");
      const medicationsQuery = query(medicationsCollectionRef, orderBy("name", "asc"));
      const medicationsSnapshot = await getDocs(medicationsQuery);
      setMedications(medicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: firestoreDateToString(doc.data().startDate),
        endDate: firestoreDateToString(doc.data().endDate),
      } as MedicationItem)));

    } catch (error) {
      console.error("Error fetching data for PDF:", error);
      setFetchError("Failed to fetch your medical data. Please try again.");
      toast({ title: "Error", description: "Could not fetch data for PDF.", variant: "destructive" });
    } finally {
      setIsFetchingData(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchDataForPdf();
    }
  }, [user, authLoading, fetchDataForPdf]);


  const handleExportClick = async () => {
    if (!user && !authLoading) {
      toast({
        title: "Authentication Required",
        description: "Please log in to export your medical data.",
        variant: "destructive",
      });
      return;
    }
    
    if (isFetchingData) {
      toast({ title: "Please wait", description: "Still fetching your data.", variant: "default" });
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
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff', 
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt', 
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = imgProps.width;
      const imgHeight = imgProps.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const finalImgWidth = imgWidth * ratio;
      const finalImgHeight = imgHeight * ratio;

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
  const isLoadingInteraction = authLoading || isGeneratingPdf || isFetchingData;
  const noDataAvailable = !medicalHistory.length && !visits.length && !medications.length;

  return (
    <>
      <div className="absolute -left-full top-0 opacity-0 pointer-events-none" aria-hidden="true">
          <PrintableMedicalReport
            ref={printableReportRef}
            user={user}
            medicalHistory={medicalHistory}
            visits={visits}
            medications={medications}
          />
      </div>

      <div className="space-y-6 max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center mb-4">
          <FileText className="mr-3 h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold">Export Medical Data</h1>
        </div>
        
        <p className="text-lg text-muted-foreground">
          Securely export {userName} comprehensive medical records as a PDF document. This document will feature {user?.displayName ? <strong>{user.displayName}</strong> : "your name"} and your recorded medical information.
        </p>
        
        {user && !isFetchingData && !fetchError && noDataAvailable && (
           <Alert variant="default" className="border-primary/50 text-left">
            <AlertTriangle className="h-4 w-4 !text-primary" />
            <AlertDescription>
                You have no medical history, visits, or medications recorded yet. The generated PDF will be mostly empty. Start adding your health data on other pages!
            </AlertDescription>
          </Alert>
        )}

        {fetchError && (
           <Alert variant="destructive" className="text-left">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}


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
            <Button size="lg" onClick={handleExportClick} className="w-full md:w-auto" disabled={isLoadingInteraction || !user}>
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating PDF...
                </>
              ) : isFetchingData ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading Data...
                </>
              ) : authLoading ? (
                <>
                  <UserCircle2 className="mr-2 h-5 w-5 animate-pulse" /> Loading User Info...
                </>
              ) : !user ? (
                 <>
                  <UserCircle2 className="mr-2 h-5 w-5" /> Login to Export
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" /> Export to PDF
                </>
              )}
            </Button>
            {!user && !authLoading && (
                 <p className="text-sm text-muted-foreground mt-2">Please log in to enable PDF export.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
