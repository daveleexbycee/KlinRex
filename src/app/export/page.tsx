
// src/app/export/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, UserCircle2, Loader2, AlertTriangle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { PrintableMedicalReport } from '@/components/export/PrintableMedicalReport';
import type { MedicalHistoryItem, VisitItem, MedicationItem } from '@/types';
import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import jsPDF from 'jspdf';
import type { jsPDF as jsPDFType } from 'jspdf'; // Import type for state
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
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split('T')[0];
  }
  return undefined; 
};


export default function ExportPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false); // Renamed from isGeneratingPdf for clarity
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [generatedPdf, setGeneratedPdf] = useState<jsPDFType | null>(null);
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
    setPdfPreviewUrl(null); // Reset preview if data re-fetches
    setGeneratedPdf(null);
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
        date: firestoreDateToString(doc.data().date)!,
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


  const handleGeneratePreview = async () => {
    if (!user && !authLoading) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate your medical data preview.",
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
    
    setIsProcessing(true);
    setPdfPreviewUrl(null);
    setGeneratedPdf(null);
    toast({ title: "Generating Preview...", description: "Please wait while your report is being prepared." });

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
      
      setGeneratedPdf(pdf);
      const dataUri = pdf.output('datauristring');
      setPdfPreviewUrl(dataUri);

      toast({ title: "Preview Ready!", description: "Your PDF preview has been generated." });

    } catch (error) {
      console.error("Error generating PDF preview:", error);
      toast({
        title: "Preview Generation Failed",
        description: "An error occurred while generating the PDF preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!generatedPdf) {
      toast({ title: "Error", description: "No PDF generated to download.", variant: "destructive" });
      return;
    }
    const userNameForFile = user?.displayName?.replace(/\s+/g, '_') || 'User';
    generatedPdf.save(`KlinRex_Report_${userNameForFile}.pdf`);
    toast({ title: "Success!", description: "Your PDF report has been downloaded." });
  };

  const userName = user?.displayName || "your";
  const isLoadingInteraction = authLoading || isProcessing || isFetchingData;
  const noDataAvailable = !isFetchingData && !fetchError && !medicalHistory.length && !visits.length && !medications.length;

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

      <div className="space-y-6 max-w-3xl mx-auto text-center"> {/* Increased max-width for preview */}
        <div className="flex items-center justify-center mb-4">
          <FileText className="mr-3 h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold">Export Medical Data</h1>
        </div>
        
        <p className="text-lg text-muted-foreground">
          Generate a preview and download {userName} comprehensive medical records as a PDF document.
        </p>
        
        {user && noDataAvailable && (
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
            <CardTitle className="text-2xl">
              Generate PDF Report{user?.displayName ? `, ${user.displayName.split(' ')[0]}?` : "?"}
            </CardTitle>
            <CardDescription>
              Click the button below to generate a preview of your medical report.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button size="lg" onClick={handleGeneratePreview} className="w-full md:w-auto" disabled={isLoadingInteraction || !user}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Preview...
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
                  <UserCircle2 className="mr-2 h-5 w-5" /> Login to Generate
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-5 w-5" /> Generate Preview
                </>
              )}
            </Button>
            {!user && !authLoading && (
                 <p className="text-sm text-muted-foreground mt-2">Please log in to enable PDF generation.</p>
            )}

            {pdfPreviewUrl && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-xl font-semibold mb-3 text-left">PDF Preview</h3>
                <div className="rounded-md border overflow-hidden bg-muted" style={{ height: '600px' }}>
                  <iframe
                    src={pdfPreviewUrl}
                    className="w-full h-full"
                    title="PDF Preview"
                    aria-label="PDF Preview"
                  />
                </div>
                <Button size="lg" onClick={handleDownloadPdf} className="w-full md:w-auto mt-4" disabled={!generatedPdf || isProcessing}>
                  <Download className="mr-2 h-5 w-5" /> Download PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
      
    