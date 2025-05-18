// src/app/ai-assistant/actions.ts
"use server";

import { smartInfoSharingAssistant, type SmartInfoSharingAssistantInput, type SmartInfoSharingAssistantOutput } from "@/ai/flows/smart-info-sharing-assistant";

export async function getAISuggestions(input: SmartInfoSharingAssistantInput): Promise<SmartInfoSharingAssistantOutput | { error: string }> {
  try {
    const result = await smartInfoSharingAssistant(input);
    return result;
  } catch (error) {
    console.error("Error calling AI assistant:", error);
    return { error: "Failed to get suggestions from AI assistant. Please try again." };
  }
}
