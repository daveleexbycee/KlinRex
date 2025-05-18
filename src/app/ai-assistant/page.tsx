// src/app/ai-assistant/page.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Bot, Sparkles, Loader2 } from "lucide-react";
import { getAISuggestions } from './actions';
import type { SmartInfoSharingAssistantInput, SmartInfoSharingAssistantOutput } from "@/ai/flows/smart-info-sharing-assistant";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';

const aiAssistantSchema = z.object({
  medicalHistory: z.string().min(50, "Please provide a summary of your medical history (at least 50 characters)."),
  reasonForVisit: z.string().min(10, "Reason for visit must be at least 10 characters."),
});

type AIAssistantFormData = z.infer<typeof aiAssistantSchema>;

export default function AIAssistantPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<AIAssistantFormData>({
    resolver: zodResolver(aiAssistantSchema),
    defaultValues: {
      medicalHistory: "",
      reasonForVisit: "",
    },
  });

  const onSubmit: SubmitHandler<AIAssistantFormData> = async (data) => {
    setIsLoading(true);
    setSuggestions(null);
    setError(null);

    const input: SmartInfoSharingAssistantInput = {
      medicalHistory: data.medicalHistory,
      reasonForVisit: data.reasonForVisit,
    };

    const result = await getAISuggestions(input);

    if ('error' in result) {
      setError(result.error);
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setSuggestions(result.suggestedInformation);
      toast({
        title: "Suggestions Ready!",
        description: "AI has provided information sharing suggestions.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <Bot className="mr-3 h-8 w-8 text-primary" />
          AI Info Sharing Assistant
        </h1>
        <p className="text-muted-foreground mt-2">
          Get smart suggestions on what medical history to share with your doctor for a more efficient consultation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prepare for Your Appointment</CardTitle>
          <CardDescription>
            Enter a summary of your relevant medical history and the reason for your upcoming visit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="medicalHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical History Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Summarize relevant past illnesses, allergies, procedures, and current medications..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reasonForVisit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Current Visit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Follow-up for blood pressure, New cough symptoms" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get AI Suggestions
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-accent" />
              Suggested Information to Share
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/50 p-4 rounded-md">
              <p>{suggestions}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
