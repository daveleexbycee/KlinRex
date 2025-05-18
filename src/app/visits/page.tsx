// src/app/visits/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { VisitItem } from "@/types";
import { PlusCircle, Edit3, Trash2, CalendarIcon, Hospital as HospitalIcon, Loader2, AlertTriangle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { Alert, AlertDescription } from '@/components/ui/alert';

const visitSchema = z.object({
  date: z.date({ required_error: "Date of visit is required." }),
  hospitalName: z.string().min(2, "Hospital name must be at least 2 characters"),
  doctorName: z.string().min(2, "Doctor name must be at least 2 characters"),
  sicknessType: z.string().min(2, "Type of sickness/reason for visit is required"),
  details: z.string().optional(),
});

type VisitFormData = z.infer<typeof visitSchema>;

// Helper to convert Firestore data (which might have Timestamps) to local state
const fromFirestore = (docData: any): Omit<VisitItem, 'id'> => ({
  ...docData,
  date: docData.date ? (docData.date instanceof Timestamp ? docData.date.toDate().toISOString().split('T')[0] : docData.date) : new Date().toISOString().split('T')[0],
});


export default function VisitsPage() {
  const [visitItems, setVisitItems] = useState<VisitItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VisitItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      date: new Date(),
      hospitalName: "",
      doctorName: "",
      sicknessType: "",
      details: "",
    },
  });

  const fetchVisitItems = useCallback(async () => {
    if (!user) {
      setVisitItems([]);
      setIsLoading(false);
      setError("Please log in to view and manage your hospital visits.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const visitsCollectionRef = collection(db, "users", user.uid, "visits");
      const q = query(visitsCollectionRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...fromFirestore(doc.data()) } as VisitItem));
      setVisitItems(items);
    } catch (e) {
      console.error("Error fetching visit items: ", e);
      setError("Failed to fetch visit items. Please try again.");
      toast({ title: "Error", description: "Could not fetch visit items.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchVisitItems();
    }
  }, [user, authLoading, fetchVisitItems]);

  useEffect(() => {
    if (editingItem) {
      form.reset({
        date: new Date(editingItem.date), // Ensure date is a Date object for the form
        hospitalName: editingItem.hospitalName,
        doctorName: editingItem.doctorName,
        sicknessType: editingItem.sicknessType,
        details: editingItem.details || "",
      });
    } else {
       form.reset({
        date: new Date(),
        hospitalName: "",
        doctorName: "",
        sicknessType: "",
        details: "",
      });
    }
  }, [editingItem, form, isFormOpen]);

  const onSubmit: SubmitHandler<VisitFormData> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save items.", variant: "destructive" });
      return;
    }
    
    const itemDataToSave = {
      ...data,
      date: format(data.date, "yyyy-MM-dd"), // Store date as string
      userId: user.uid,
    };

    setIsLoading(true);
    try {
      if (editingItem) {
        const itemDocRef = doc(db, "users", user.uid, "visits", editingItem.id);
        await updateDoc(itemDocRef, itemDataToSave);
        toast({ title: "Success", description: "Visit details updated." });
      } else {
        await addDoc(collection(db, "users", user.uid, "visits"), itemDataToSave);
        toast({ title: "Success", description: "Visit details added." });
      }
      fetchVisitItems();
      setEditingItem(null);
      setIsFormOpen(false);
      form.reset();
    } catch (e) {
      console.error("Error saving visit item: ", e);
      toast({ title: "Error", description: "Could not save visit item.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to delete items.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const itemDocRef = doc(db, "users", user.uid, "visits", id);
      await deleteDoc(itemDocRef);
      toast({ title: "Success", description: "Visit details deleted." });
      fetchVisitItems();
    } catch (e) {
      console.error("Error deleting visit item: ", e);
      toast({ title: "Error", description: "Could not delete visit item.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const openEditDialog = (item: VisitItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const openNewDialog = () => {
     if (!user) {
      toast({ title: "Login Required", description: "Please log in to log hospital visits.", variant: "default" });
      return;
    }
    setEditingItem(null);
    form.reset({ date: new Date(), hospitalName: "", doctorName: "", sicknessType: "", details: "" });
    setIsFormOpen(true);
  };

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
        <h1 className="text-3xl font-bold flex items-center"><HospitalIcon className="mr-3 h-8 w-8 text-primary" />Hospital Visits</h1>
        <Button onClick={openNewDialog} disabled={!user || isLoading}>
          <PlusCircle className="mr-2 h-5 w-5" /> Log New Visit
        </Button>
      </div>
      <p className="text-muted-foreground">
        Keep a record of your hospital visits, attending doctors, and reasons for visit.
      </p>

      {!user && !authLoading && (
        <Alert variant="default" className="border-primary/50">
          <AlertTriangle className="h-4 w-4 !text-primary" />
          <AlertDescription>
            Please log in to manage your hospital visits. Your data will be securely stored and associated with your account.
          </AlertDescription>
        </Alert>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Log"} Hospital Visit</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Visit</FormLabel>
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
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hospitalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., City General Hospital" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doctorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor Attended</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Dr. Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sicknessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sickness / Reason for Visit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Annual Checkup, Flu Symptoms" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notes on diagnosis, treatment, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Visit
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {isLoading && visitItems.length === 0 && user &&(
         <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading hospital visits...</p>
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <CardTitle>Error</CardTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && visitItems.length === 0 && user && (
         <Card className="text-center py-12">
          <CardHeader>
            <HospitalIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4 text-xl">No Visits Logged Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Start logging your hospital visits to maintain a complete record.
            </CardDescription>
            <Button onClick={openNewDialog} className="mt-6" disabled={!user}>
              <PlusCircle className="mr-2 h-5 w-5" /> Log First Visit
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && visitItems.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {visitItems.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{item.hospitalName}</CardTitle>
                <CardDescription>{format(new Date(item.date), "PPP")}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <p><span className="font-semibold">Doctor:</span> {item.doctorName}</p>
                <p><span className="font-semibold">Reason:</span> {item.sicknessType}</p>
                {item.details && <p className="text-sm text-muted-foreground mt-2"><span className="font-semibold">Details:</span> {item.details}</p>}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-4 border-t">
                 <Button variant="outline" size="sm" onClick={() => openEditDialog(item)} disabled={isLoading}>
                  <Edit3 className="mr-1 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
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

    