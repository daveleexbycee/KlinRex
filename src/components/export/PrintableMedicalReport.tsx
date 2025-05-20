// src/components/export/PrintableMedicalReport.tsx
"use client";

import React from 'react';
import type { User } from "firebase/auth";
import type { MedicalHistoryItem, VisitItem, MedicationItem } from "@/types";
import { format } from "date-fns";

interface PrintableMedicalReportProps {
  user: User | null;
  medicalHistory: MedicalHistoryItem[];
  visits: VisitItem[];
  medications: MedicationItem[];
}

const formatDateSafe = (dateString: string | undefined, dateFormat: string = "PPP") => {
  if (!dateString) return "N/A";
  try {
    // Ensure dateString is treated as UTC to avoid timezone issues if it's just YYYY-MM-DD
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`);
    return format(date, dateFormat);
  } catch (e) {
    return "Invalid Date";
  }
};


export const PrintableMedicalReport = React.forwardRef<HTMLDivElement, PrintableMedicalReportProps>(
  ({ user, medicalHistory, visits, medications }, ref) => {
    const reportDate = format(new Date(), "PPP p");

    // Watermark configuration
    const watermarkText = "KlinRex";
    const watermarkElements = [];
    const numWatermarksAcross = 4; // How many watermarks fit horizontally
    const numWatermarksDown = 10; // How many watermarks fit vertically
    const watermarkOpacity = 0.05; // Very subtle

    for (let i = 0; i < numWatermarksDown; i++) {
      for (let j = 0; j < numWatermarksAcross; j++) {
        watermarkElements.push(
          <div
            key={`watermark-${i}-${j}`}
            className="absolute text-neutral-400 font-bold select-none -z-10 pointer-events-none"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '60px', // Smaller font size for tiling
              opacity: watermarkOpacity,
              top: `${(i * (100 / numWatermarksDown)) + (j % 2 === 0 ? 0 : 5)}%`, // Stagger rows slightly
              left: `${(j * (100 / numWatermarksAcross)) + (i % 2 === 0 ? 0 : 5)}%`,
              transform: 'rotate(-30deg) translate(-50%, -50%)',
              transformOrigin: 'center center',
              whiteSpace: 'nowrap',
            }}
          >
            {watermarkText}
          </div>
        );
      }
    }


    return (
      <div
        id="printable-report"
        ref={ref}
        className="p-10 bg-white text-neutral-800 font-sans w-[210mm] min-h-[297mm] shadow-lg printable-report-styles relative overflow-hidden" // Added overflow-hidden
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Watermark Container */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
            {watermarkElements}
        </div>
        
        {/* Header */}
        <header className="mb-8 border-b-2 border-neutral-300 pb-4 relative z-0">
          <h1 className="text-4xl font-bold text-primary mb-2" style={{color: '#4A8FE7 !important'}}>KlinRex Medical Report</h1>
          {user?.displayName && (
            <p className="text-2xl font-semibold">{user.displayName}</p>
          )}
          {user?.email && (
            <p className="text-md text-neutral-600">Email: {user.email}</p>
          )}
          <p className="text-md text-neutral-600">Report Generated: {reportDate}</p>
        </header>

        {/* Sections */}
        <section className="mb-8 relative z-0">
          <h2 className="text-2xl font-semibold text-primary border-b border-neutral-300 pb-2 mb-4" style={{color: '#4A8FE7 !important'}}>
            Medical History
          </h2>
          {medicalHistory.length > 0 ? (
            <ul className="space-y-3">
              {medicalHistory.map((item) => (
                <li key={item.id} className="p-3 border border-neutral-200 rounded-md bg-neutral-50/50">
                  <p className="font-bold text-lg">{item.description} <span className="text-sm font-normal text-neutral-500">({item.type})</span></p>
                  {item.date && <p className="text-sm text-neutral-600">Date: {formatDateSafe(item.date)}</p>}
                  {item.notes && <p className="text-sm text-neutral-600">Notes: {item.notes}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-neutral-500 italic">No medical history recorded.</p>
          )}
        </section>

        <section className="mb-8 relative z-0">
          <h2 className="text-2xl font-semibold text-primary border-b border-neutral-300 pb-2 mb-4" style={{color: '#4A8FE7 !important'}}>
            Hospital Visits
          </h2>
          {visits.length > 0 ? (
            <ul className="space-y-3">
              {visits.map((item) => (
                <li key={item.id} className="p-3 border border-neutral-200 rounded-md bg-neutral-50/50">
                  <p className="font-bold text-lg">{item.hospitalName} - <span className="font-normal">{formatDateSafe(item.date)}</span></p>
                  <p className="text-sm text-neutral-600">Doctor: {item.doctorName}</p>
                  <p className="text-sm text-neutral-600">Reason: {item.sicknessType}</p>
                  {item.details && <p className="text-sm text-neutral-600">Details: {item.details}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-neutral-500 italic">No hospital visits recorded.</p>
          )}
        </section>

        <section className="relative z-0">
          <h2 className="text-2xl font-semibold text-primary border-b border-neutral-300 pb-2 mb-4" style={{color: '#4A8FE7 !important'}}>
            Medications
          </h2>
          {medications.length > 0 ? (
            <ul className="space-y-3">
              {medications.map((item) => (
                <li key={item.id} className="p-3 border border-neutral-200 rounded-md bg-neutral-50/50">
                  <p className="font-bold text-lg">{item.name}</p>
                  <p className="text-sm text-neutral-600">Dosage: {item.dosage} - Frequency: {item.frequency}</p>
                  {item.reason && <p className="text-sm text-neutral-600">Reason: {item.reason}</p>}
                  {(item.startDate || item.endDate) && (
                    <p className="text-sm text-neutral-600">
                      Period: {formatDateSafe(item.startDate)} - {item.endDate ? formatDateSafe(item.endDate) : 'Ongoing'}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-neutral-500 italic">No medications recorded.</p>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-10 pt-4 border-t border-neutral-300 text-center text-xs text-neutral-500 relative z-0">
          KlinRex - Your Personal Health Organizer
        </footer>
        <style jsx global>{`
          .printable-report-styles h1,
          .printable-report-styles h2,
          .printable-report-styles p,
          .printable-report-styles li,
          .printable-report-styles div:not(.watermark-text) { /* Avoid affecting watermark text color */
            color: #333 !important; /* Force dark text for PDF */
          }
          .printable-report-styles .text-primary {
              color: #4A8FE7 !important; /* Ensure primary color is used as defined */
          }
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-report, #printable-report * {
              visibility: visible;
            }
            #printable-report {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 20px; /* Adjust padding for printing */
              box-shadow: none;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    );
  }
);
PrintableMedicalReport.displayName = 'PrintableMedicalReport';
