// src/types/index.ts

export interface MedicalHistoryItem {
  id: string;
  type: 'Illness' | 'Allergy' | 'Procedure' | 'Other';
  description: string;
  date?: string; // Optional: YYYY-MM-DD
  notes?: string;
}

export interface VisitItem {
  id: string;
  date: string; // YYYY-MM-DD
  hospitalName: string;
  doctorName: string;
  sicknessType: string;
  details?: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // e.g., "Once a day", "Twice a day with meals"
  reason?: string;
  startDate?: string; // Optional: YYYY-MM-DD
  endDate?: string; // Optional: YYYY-MM-DD
}
