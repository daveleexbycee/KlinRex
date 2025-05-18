// src/app/medications/page.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { MedicationItem } from "@/types";
import { PlusCircle, Edit3, Trash2, CalendarIcon, Pill as PillIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const medicationSchema = z.object({
  name: z.string().min(2, "Medication name must be at least 2 characters"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(2, "Frequency is required"),
  reason: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
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

export default function MedicationsPage() {
  const [medicationItems, setMedicationItems] = useState<MedicationItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MedicationItem | null>(null);
  const { toast } = useToast();

  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "",
      reason: "",
    },
  });

  React.useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name,
        dosage: editingItem.dosage,
        frequency: editingItem.frequency,
        reason: editingItem.reason || "",
        startDate: editingItem.startDate ? new Date(editingItem.startDate) : undefined,
        endDate: editingItem.endDate ? new Date(editingItem.endDate) : undefined,
      });
    } else {
      form.reset({
        name: "",
        dosage: "",
        frequency: "",
        reason: "",
        startDate: undefined,
        endDate: undefined,
      });
    }
  }, [editingItem, form, isFormOpen]);

  const onSubmit: SubmitHandler<MedicationFormData> = (data) => {
    const newItem: MedicationItem = {
      id: editingItem ? editingItem.id : crypto.randomUUID(),
      ...data,
      startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : undefined,
      endDate: data.endDate ? format(data.endDate, "yyyy-MM-dd") : undefined,
    };

    if (editingItem) {
      setMedicationItems(medicationItems.map(item => item.id === editingItem.id ? newItem : item));
      toast({ title: "Success", description: "Medication updated." });
    } else {
      setMedicationItems([newItem, ...medicationItems]);
      toast({ title: "Success", description: "Medication added." });
    }
    
    setEditingItem(null);
    setIsFormOpen(false);
    form.reset();
  };

  const handleDelete = (id: string) => {
    setMedicationItems(medicationItems.filter(item => item.id !== id));
    toast({ title: "Success", description: "Medication deleted.", variant: "destructive" });
  };

  const openEditDialog = (item: MedicationItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };
  
  const openNewDialog = () => {
    setEditingItem(null);
    form.reset();
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
                disabled={(date) => date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center"><PillIcon className="mr-3 h-8 w-8 text-primary" />Medications</h1>
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Medication
        </Button>
      </div>
      <p className="text-muted-foreground">
        Manage your medication list, including dosages, frequency, and treatment periods.
      </p>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
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
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Medication</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {medicationItems.length === 0 ? (
        <Card className="text-center py-12">
           <CardHeader>
            <PillIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4 text-xl">No Medications Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Start adding your medications to keep track of your treatment.
            </CardDescription>
            <Button onClick={openNewDialog} className="mt-6">
              <PlusCircle className="mr-2 h-5 w-5" /> Add First Medication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {medicationItems.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{item.name}</CardTitle>
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
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                  <Edit3 className="mr-1 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
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
