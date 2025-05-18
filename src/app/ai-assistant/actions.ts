// src/app/ai-assistant/actions.ts
"use server";

import { healthAssistant, type HealthAssistantInput, type HealthAssistantOutput } from "@/ai/flows/health-assistant";

export async function getAIHealthAssistance(input: HealthAssistantInput): Promise<HealthAssistantOutput | { error: string }> {
  try {
    // Basic validation to ensure at least one input is provided
    if (!input.question && !input.drugImageUri) {
      return { error: "Please ask a question or upload an image." };
    }
    const result = await healthAssistant(input);
    return result;
  } catch (error) {
    console.error("Error calling AI health assistant:", error);
    // Try to get a more specific error message if available
    const errorMessage = error instanceof Error ? error.message : "Failed to get assistance from AI. Please try again.";
    return { error: errorMessage };
  }
}
