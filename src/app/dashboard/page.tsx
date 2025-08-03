// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, HeartPulse, Hospital, Pill, BellRing, AlertTriangle, UserCircle2 } from 'lucide-react';
import type { MedicationItem } from '@/types';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reminders, setReminders] = useState<MedicationItem[]>([]);
  const [isLoadingReminders, setIsLoadingReminders] = useState(true);

  const fetchReminders = useCallback(async () => {
    if (!user) return;
    setIsLoadingReminders(true);
    try {
      const medicationsCollectionRef = collection(db, "users", user.uid, "medications");
      const q = query(
        medicationsCollectionRef,
        where("reminders", "==", true),
        orderBy("name", "asc")
      );
      const querySnapshot = await getDocs(q);
      const allReminderMeds = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicationItem));
      
      const today = new Date();
      const activeReminders = allReminderMeds.filter(med => {
        // Ensure start and end dates exist before trying to parse them
        if (!med.startDate) return false; // Or handle as needed if no start date means it's always active
        
        const startDate = parseISO(med.startDate);
        // If there's an end date, use it; otherwise, use today to make the interval valid for checking.
        const endDate = med.endDate ? parseISO(med.endDate) : endOfDay(today);
        
        return isWithinInterval(today, { start: startOfDay(startDate), end: endOfDay(endDate) });
      });

      setReminders(activeReminders);
    } catch (error) {
      console.error("Error fetching medication reminders:", error);
      // Handle error display if necessary
    } finally {
      setIsLoadingReminders(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      return; // Wait until auth state is determined
    }
    if (!user) {
      router.replace('/'); // Redirect to landing if not logged in
    } else {
      fetchReminders();
    }
  }, [user, authLoading, router, fetchReminders]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome, {user.displayName?.split(' ')[0] || 'User'}!</h1>
        <p className="text-muted-foreground">Here's your health summary for today.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellRing className="mr-2 h-5 w-5 text-primary" />
            Today's Medication Reminders
          </CardTitle>
          <CardDescription>Medications you need to take today.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingReminders ? (
             <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2">Loading reminders...</p>
             </div>
          ) : reminders.length > 0 ? (
            <ul className="space-y-3">
              {reminders.map(med => (
                <li key={med.id} className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
                  </div>
                  <Pill className="h-6 w-6 text-primary" />
                </li>
              ))}
            </ul>
          ) : (
             <Alert variant="default" className="border-primary/50 text-left">
                <AlertTriangle className="h-4 w-4 !text-primary" />
                <AlertTitle>No Reminders for Today</AlertTitle>
                <AlertDescription>
                    You have no active medication reminders scheduled for today. You can enable reminders when adding or editing a medication.
                </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/medical-history" className="block h-full">
            <CardHeader>
              <HeartPulse className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Medicals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">View and manage your medical history, allergies, and procedures.</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/visits" className="block h-full">
            <CardHeader>
              <Hospital className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Keep a log of your hospital visits and doctor appointments.</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors">
           <Link href="/medications" className="block h-full">
            <CardHeader>
              <Pill className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Meds</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage your list of medications and their schedules.</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
