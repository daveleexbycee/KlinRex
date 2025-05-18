// src/app/medical-history/page.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { MedicalHistoryItem } from "@/types";
import { PlusCircle, Edit3, Trash2, CalendarIcon, HeartPulse } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const medicalHistorySchema = z.object({
  type: z.enum(["Illness", "Allergy", "Procedure", "Other"]),
  description: z.string().min(3, "Description must be at least 3 characters"),
  date: z.date().optional(),
  notes: z.string().optional(),
});

type MedicalHistoryFormData = z.infer<typeof medicalHistorySchema>;

export default function MedicalHistoryPage() {
  const [historyItems, setHistoryItems] = useState<MedicalHistoryItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MedicalHistoryItem | null>(null);
  const { toast } = useToast();

  const form = useForm<MedicalHistoryFormData>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: {
      type: "Illness",
      description: "",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (editingItem) {
      form.reset({
        type: editingItem.type,
        description: editingItem.description,
        date: editingItem.date ? new Date(editingItem.date) : undefined,
        notes: editingItem.notes || "",
      });
    } else {
      form.reset({
        type: "Illness",
        description: "",
        date: undefined,
        notes: "",
      });
    }
  }, [editingItem, form, isFormOpen]);


  const onSubmit: SubmitHandler<MedicalHistoryFormData> = (data) => {
    const newItem: MedicalHistoryItem = {
      id: editingItem ? editingItem.id : crypto.randomUUID(),
      ...data,
      date: data.date ? format(data.date, "yyyy-MM-dd") : undefined,
    };

    if (editingItem) {
      setHistoryItems(historyItems.map(item => item.id === editingItem.id ? newItem : item));
      toast({ title: "Success", description: "Medical history item updated." });
    } else {
      setHistoryItems([newItem, ...historyItems]);
      toast({ title: "Success", description: "Medical history item added." });
    }
    
    setEditingItem(null);
    setIsFormOpen(false);
    form.reset();
  };

  const handleDelete = (id: string) => {
    setHistoryItems(historyItems.filter(item => item.id !== id));
    toast({ title: "Success", description: "Medical history item deleted.", variant: "destructive" });
  };

  const openEditDialog = (item: MedicalHistoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };
  
  const openNewDialog = () => {
    setEditingItem(null);
    form.reset();
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center"><HeartPulse className="mr-3 h-8 w-8 text-primary" />Medical History</h1>
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Item
        </Button>
      </div>
      <p className="text-muted-foreground">
        Keep track of your illnesses, allergies, past procedures, and other significant medical events.
      </p>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Add"} Medical History Item</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Illness">Illness</SelectItem>
                        <SelectItem value="Allergy">Allergy</SelectItem>
                        <SelectItem value="Procedure">Procedure</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Seasonal Pollen Allergy, Appendix Removal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date (Optional)</FormLabel>
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional details..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Item</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {historyItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <HeartPulse className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4 text-xl">No Medical History Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Start adding your medical history items to build your health record.
            </CardDescription>
            <Button onClick={openNewDialog} className="mt-6">
              <PlusCircle className="mr-2 h-5 w-5" /> Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {historyItems.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{item.type}</CardTitle>
                <CardDescription>
                  {item.date ? format(new Date(item.date), "PPP") : "Date not specified"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="font-medium">{item.description}</p>
                {item.notes && <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>}
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
