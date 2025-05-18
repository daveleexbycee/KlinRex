// src/ai/flows/smart-info-sharing-assistant.ts
'use server';

/**
 * @fileOverview An AI assistant that reviews a patient's medical history and suggests relevant information to share with the doctor.
 *
 * - smartInfoSharingAssistant - A function that processes medical history and suggests relevant information.
 * - SmartInfoSharingAssistantInput - The input type for the smartInfoSharingAssistant function.
 * - SmartInfoSharingAssistantOutput - The return type for the smartInfoSharingAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartInfoSharingAssistantInputSchema = z.object({
  medicalHistory: z
    .string()
    .describe('The patient medical history including illnesses, allergies, and past procedures.'),
  reasonForVisit: z.string().describe('The described reason for the doctor visit.'),
});
export type SmartInfoSharingAssistantInput = z.infer<
  typeof SmartInfoSharingAssistantInputSchema
>;

const SmartInfoSharingAssistantOutputSchema = z.object({
  suggestedInformation: z
    .string()
    .describe('The suggested information to share with the doctor.'),
});
export type SmartInfoSharingAssistantOutput = z.infer<
  typeof SmartInfoSharingAssistantOutputSchema
>;

export async function smartInfoSharingAssistant(
  input: SmartInfoSharingAssistantInput
): Promise<SmartInfoSharingAssistantOutput> {
  return smartInfoSharingAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartInfoSharingAssistantPrompt',
  input: {schema: SmartInfoSharingAssistantInputSchema},
  output: {schema: SmartInfoSharingAssistantOutputSchema},
  prompt: `You are an AI assistant that reviews a patient's medical history and suggests relevant information to share with the doctor during their appointment.

  Medical History: {{{medicalHistory}}}
  Reason for Visit: {{{reasonForVisit}}}

  Based on the medical history and the reason for the visit, suggest the most relevant information the patient should share with the doctor to ensure an efficient and productive consultation.
  Focus on relevant past illnesses, allergies, procedures, and medications that could impact the current visit.  Do not include information that is not relevant to the visit.
  Return the suggested information in a paragraph format.
  `,
});

const smartInfoSharingAssistantFlow = ai.defineFlow(
  {
    name: 'smartInfoSharingAssistantFlow',
    inputSchema: SmartInfoSharingAssistantInputSchema,
    outputSchema: SmartInfoSharingAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
