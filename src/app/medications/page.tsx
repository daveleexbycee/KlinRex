// src/app/medications/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { MedicationItem } from "@/types";
import { PlusCircle, Edit3, Trash2, CalendarIcon, Pill as PillIcon, Loader2, AlertTriangle, BellRing } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { Alert, AlertDescription } from '@/components/ui/alert';

const medicationSchema = z.object({
  name: z.string().min(2, "Medication name must be at least 2 characters"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(2, "Frequency is required"),
  reason: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  reminders: z.boolean().default(false),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, {
  message: "End date cannot be before start date",
  path: ["endDate"],
});

type MedicationFormData = z.infer<typeof medicationSchema>;

// Helper to convert Firestore data (which might have Timestamps for dates) to local state
const fromFirestore = (docData: any): Omit<MedicationItem, 'id'> => ({
  ...docData,
  // Ensure dates are strings if stored as strings, or convert from Timestamps
  startDate: docData.startDate ? (docData.startDate instanceof Timestamp ? docData.startDate.toDate().toISOString().split('T')[0] : docData.startDate) : undefined,
  endDate: docData.endDate ? (docData.endDate instanceof Timestamp ? docData.endDate.toDate().toISOString().split('T')[0] : docData.endDate) : undefined,
});

export default function MedicationsPage() {
  const [medicationItems, setMedicationItems] = useState<MedicationItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MedicationItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "",
      reason: "",
      startDate: undefined,
      endDate: undefined,
      reminders: false,
    },
  });

  const fetchMedicationItems = useCallback(async () => {
    if (!user) {
      setMedicationItems([]);
      setIsLoading(false);
      setError("Please log in to view and manage your medications.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const medicationsCollectionRef = collection(db, "users", user.uid, "medications");
      const q = query(medicationsCollectionRef, orderBy("name", "asc")); // Order by name
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...fromFirestore(doc.data()) } as MedicationItem));
      setMedicationItems(items);
    } catch (e) {
      console.error("Error fetching medication items: ", e);
      setError("Failed to fetch medication items. Please try again.");
      toast({ title: "Error", description: "Could not fetch medication items.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchMedicationItems();
    }
  }, [user, authLoading, fetchMedicationItems]);

  useEffect(() => {
    if (isFormOpen) { // Only reset form when dialog opens
      if (editingItem) {
        form.reset({
          name: editingItem.name,
          dosage: editingItem.dosage,
          frequency: editingItem.frequency,
          reason: editingItem.reason || "",
          startDate: editingItem.startDate ? new Date(editingItem.startDate) : undefined,
          endDate: editingItem.endDate ? new Date(editingItem.endDate) : undefined,
          reminders: editingItem.reminders || false,
        });
      } else {
        form.reset({
          name: "",
          dosage: "",
          frequency: "",
          reason: "",
          startDate: undefined,
          endDate: undefined,
          reminders: false,
        });
      }
    }
  }, [editingItem, form, isFormOpen]);

  const onSubmit: SubmitHandler<MedicationFormData> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save medications.", variant: "destructive" });
      return;
    }
    
    const itemDataToSave = {
      ...data,
      startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : null,
      endDate: data.endDate ? format(data.endDate, "yyyy-MM-dd") : null,
      userId: user.uid,
    };

    // setIsLoading(true); // Use a more specific loading state for form submission if needed or reuse general
    const formSubmitToastId = toast({ title: editingItem ? "Updating..." : "Adding...", description: "Saving medication." });
    try {
      if (editingItem) {
        const itemDocRef = doc(db, "users", user.uid, "medications", editingItem.id);
        await updateDoc(itemDocRef, itemDataToSave);
        toast({ id: formSubmitToastId.id, title: "Success", description: "Medication updated." });
      } else {
        await addDoc(collection(db, "users", user.uid, "medications"), itemDataToSave);
        toast({ id: formSubmitToastId.id, title: "Success", description: "Medication added." });
      }
      fetchMedicationItems(); // Re-fetch to get the latest data
      setEditingItem(null);
      setIsFormOpen(false);
      form.reset(); // Reset form after successful submission
    } catch (e) {
      console.error("Error saving medication item: ", e);
      toast({ id: formSubmitToastId.id, title: "Error", description: "Could not save medication.", variant: "destructive" });
    } finally {
      // setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to delete medications.", variant: "destructive" });
      return;
    }
    // Consider a confirmation dialog here for better UX
    const deleteToastId = toast({ title: "Deleting...", description: "Removing medication." });
    try {
      const itemDocRef = doc(db, "users", user.uid, "medications", id);
      await deleteDoc(itemDocRef);
      toast({ id: deleteToastId.id, title: "Success", description: "Medication deleted." });
      fetchMedicationItems(); // Re-fetch
    } catch (e) {
      console.error("Error deleting medication item: ", e);
      toast({ id: deleteToastId.id, title: "Error", description: "Could not delete medication.", variant: "destructive" });
    }
  };

  const openEditDialog = (item: MedicationItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };
  
  const openNewDialog = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to add medications.", variant: "default" });
      return;
    }
    setEditingItem(null);
    // form.reset(); // Reset is handled by useEffect on isFormOpen
    setIsFormOpen(true);
  };

  const DateField = ({ name, label }: { name: "startDate" | "endDate", label: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => date < new Date("1900-01-01")} // Allow future dates for end date planning
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center"><PillIcon className="mr-3 h-8 w-8 text-primary" />Medications</h1>
        <Button onClick={openNewDialog} disabled={!user || isLoading}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Medication
        </Button>
      </div>
      <p className="text-muted-foreground">
        Manage your medication list, including dosages, frequency, and treatment periods.
      </p>

      {!user && !authLoading && (
        <Alert variant="default" className="border-primary/50">
          <AlertTriangle className="h-4 w-4 !text-primary" />
          <AlertDescription>
            Please log in to manage your medications. Your data will be securely stored and associated with your account.
          </AlertDescription>
        </Alert>
      )}
      
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) {
          setEditingItem(null); // Clear editing item when dialog is closed
          form.reset(); // Also reset form on close
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Add"} Medication</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Amoxicillin, Ibuprofen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 500mg, 1 tablet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Twice a day" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Taking (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bacterial infection, Pain relief" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateField name="startDate" label="Start Date (Optional)" />
                <DateField name="endDate" label="End Date (Optional)" />
              </div>
               <FormField
                control={form.control}
                name="reminders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
                    <div className="space-y-0.5">
                        <FormLabel className="flex items-center">
                            <BellRing className="mr-2 h-4 w-4" />
                            Enable Reminders
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                            Show this medication on your dashboard when active.
                        </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Medication
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {isLoading && medicationItems.length === 0 && user && (
         <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading medications...</p>
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <CardTitle>Error</CardTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && medicationItems.length === 0 && user && (
        <Card className="text-center py-12">
           <CardHeader>
            <PillIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4 text-xl">No Medications Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Start adding your medications to keep track of your treatment.
            </CardDescription>
            <Button onClick={openNewDialog} className="mt-6" disabled={!user}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add First Medication
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && medicationItems.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {medicationItems.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    {item.reminders && <BellRing className="h-5 w-5 text-primary" title="Reminders Enabled"/>}
                </div>
                <CardDescription>{item.dosage} - {item.frequency}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-1">
                {item.reason && <p><span className="font-semibold">Reason:</span> {item.reason}</p>}
                {item.startDate && (
                  <p className="text-sm">
                    <span className="font-semibold">Period:</span> {format(new Date(item.startDate), "MMM d, yyyy")}
                    {item.endDate ? ` - ${format(new Date(item.endDate), "MMM d, yyyy")}` : " - Ongoing"}
                  </p>
                )}
                 {!item.startDate && item.endDate && (
                    <p className="text-sm">
                        <span className="font-semibold">Ends:</span> {format(new Date(item.endDate), "MMM d, yyyy")}
                    </p>
                 )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(item)} disabled={isLoading || form.formState.isSubmitting}>
                  <Edit3 className="mr-1 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)} disabled={isLoading || form.formState.isSubmitting}>
                  {(isLoading || form.formState.isSubmitting) && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
