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
import { Sparkles, Loader2, ImageUp, HelpCircle } from "lucide-react";
import { getAIHealthAssistance } from './actions';
import type { HealthAssistantInput, HealthAssistantOutput } from "@/ai/flows/health-assistant";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Custom "ΔΣ" icon component
const DeltaSigmaIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 40 24" // Adjusted viewBox
    className={`delta-sigma-container ${className || ''}`}
  >
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize="18"
      className="delta-sigma-text-animated"
    >
      ΔΣ
    </text>
  </svg>
);


const aiAssistantSchema = z.object({
  question: z.string().optional(),
  drugImage: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE_BYTES,
      `Max image size is ${MAX_FILE_SIZE_MB}MB.`
    )
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
}).refine(data => !!data.question || (data.drugImage && data.drugImage.length > 0), {
  message: "Please ask a question or upload an image.",
  path: ["question"], 
});


type AIAssistantFormData = z.infer<typeof aiAssistantSchema>;

export default function AIHealthAssistantPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<HealthAssistantOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<AIAssistantFormData>({
    resolver: zodResolver(aiAssistantSchema),
    defaultValues: {
      question: "",
      drugImage: undefined,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        form.setError("drugImage", { type: "manual", message: `Max image size is ${MAX_FILE_SIZE_MB}MB.` });
        setImagePreview(null);
        event.target.value = ""; 
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        form.setError("drugImage", { type: "manual", message: "Only .jpg, .jpeg, .png and .webp formats are supported." });
        setImagePreview(null);
        event.target.value = ""; 
        return;
      }
      form.clearErrors("drugImage");
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit: SubmitHandler<AIAssistantFormData> = async (data) => {
    setIsLoading(true);
    setAiResponse(null);
    setError(null);

    const input: HealthAssistantInput = {
      question: data.question,
    };

    if (data.drugImage && typeof data.drugImage.length === 'number' && data.drugImage.length > 0) {
      const file = data.drugImage[0];
      if (file) { 
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          input.drugImageUri = reader.result as string;
          await fetchAIResponse(input);
        };
        reader.onerror = () => {
          setError("Failed to read image file.");
          toast({ title: "Error", description: "Failed to read image file.", variant: "destructive" });
          setIsLoading(false);
        };
      } else {
        await fetchAIResponse(input);
      }
    } else {
      await fetchAIResponse(input);
    }
  };

  const fetchAIResponse = async (input: HealthAssistantInput) => {
    const result = await getAIHealthAssistance(input);

    if ('error' in result) {
      setError(result.error);
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setAiResponse(result);
      toast({
        title: "AI Response Ready!",
        description: "KlinRex AI has provided a response.",
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <DeltaSigmaIcon className="mr-3 h-8 w-8" />
          MedRec AI
        </h1>
        <p className="text-muted-foreground mt-2">
          Your AI-powered health assistant. Ask questions or identify drugs from images.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get AI Assistance</CardTitle>
          <CardDescription>
            Enter your health question and/or upload a drug image.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Ask a Health Question (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., What are the common symptoms of flu? How does metformin work?"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="drugImage"
                render={({ field: { onChange, value, ...restField } }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <ImageUp className="mr-2 h-4 w-4" />
                      Upload Drug Image (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        onChange={(e) => {
                          onChange(e.target.files); 
                          handleImageChange(e);
                        }}
                        {...restField} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {imagePreview && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Image Preview:</p>
                  <Image 
                    src={imagePreview} 
                    alt="Drug image preview" 
                    width={200} 
                    height={200} 
                    className="rounded-md border object-contain max-h-48" 
                    data-ai-hint="drug preview"
                  />
                  <Button variant="outline" size="sm" onClick={() => {
                      setImagePreview(null);
                      form.setValue("drugImage", undefined);
                      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                      if (fileInput) fileInput.value = "";
                  }}>Remove Image</Button>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Assistance...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get AI Assistance
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {aiResponse && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DeltaSigmaIcon className="mr-2 h-5 w-5" />
              KlinRex AI Response
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiResponse.drugIdentification && (
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Drug Identification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 prose prose-sm max-w-none dark:prose-invert">
                  {aiResponse.drugIdentification.error ? (
                     <p className="text-destructive">{aiResponse.drugIdentification.error}</p>
                  ) : (
                    <>
                      <p><strong>Name:</strong> {aiResponse.drugIdentification.name || "N/A"}</p>
                      <p><strong>Dosage:</strong> {aiResponse.drugIdentification.dosage || "N/A"}</p>
                      <p><strong>Purpose/Advice:</strong></p>
                      <div dangerouslySetInnerHTML={{ __html: aiResponse.drugIdentification.purpose?.replace(/\n/g, '<br />') || "N/A" }} />
                      <p><strong>Confidence:</strong> {aiResponse.drugIdentification.confidence || "N/A"}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {aiResponse.healthAnswer && (
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Health Question Answer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: aiResponse.healthAnswer.replace(/\n/g, '<br />') }} />
                </CardContent>
              </Card>
            )}
            
            {aiResponse.generalAdvice && (
                <Alert variant="default" className="border-primary/50">
                    <HelpCircle className="h-4 w-4 !text-primary" />
                    <AlertTitle className="text-primary">Important Reminder</AlertTitle>
                    <AlertDescription>
                        {aiResponse.generalAdvice}
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    