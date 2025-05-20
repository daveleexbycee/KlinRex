
// src/ai/flows/health-assistant.ts
'use server';

/**
 * @fileOverview An AI assistant that answers health questions and identifies drugs from images.
 *
 * - healthAssistant - A function that processes health queries and/or drug images.
 * - HealthAssistantInput - The input type for the healthAssistant function.
 * - HealthAssistantOutput - The return type for the healthAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HealthAssistantInputSchema = z.object({
  question: z.string().optional().describe('A general health-related question from the user.'),
  drugImageUri: z
    .string()
    .optional()
    .describe(
      "A photo of a drug, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type HealthAssistantInput = z.infer<typeof HealthAssistantInputSchema>;

const DrugIdentificationSchema = z.object({
  name: z.string().describe('The common or brand name of the drug.'),
  dosage: z.string().optional().describe('The dosage if visible or inferable (e.g., "10mg").'),
  purpose: z.string().optional().describe('A concise summary of its primary medical purpose or what it is commonly used to treat. Also, list 1-2 general, actionable pieces of advice related to its use (e.g., "take with food if stomach upset occurs", "store in a cool, dry place").'),
  confidence: z.string().optional().describe('Confidence level of identification (e.g., High, Medium, Low).'),
  error: z.string().optional().describe('Any error message if identification failed, e.g., "Not a drug" or "Could not identify".')
});

const HealthAssistantOutputSchema = z.object({
  healthAnswer: z.string().optional().describe('The summarized answer to the user health question, including actionable steps.'),
  drugIdentification: DrugIdentificationSchema.optional().describe('Details of the identified drug from the image.'),
  generalAdvice: z.string().optional().describe('A general reminder to consult healthcare professionals.'),
});
export type HealthAssistantOutput = z.infer<typeof HealthAssistantOutputSchema>;

export async function healthAssistant(
  input: HealthAssistantInput
): Promise<HealthAssistantOutput> {
  return healthAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'healthAssistantPrompt',
  input: {schema: HealthAssistantInputSchema},
  output: {schema: HealthAssistantOutputSchema},
  prompt: `You are KlinRex AI, a helpful AI medical assistant. Your goal is to assist users with health-related questions and identify medications from images.
**Keep all your textual explanations and summaries very brief, ideally 1-3 sentences for main points before listing actionable advice.**
When answering health questions or describing the purpose of a drug, provide a concise summary and then list actionable, general self-care tips or steps a person might consider. Always emphasize that this is not a substitute for professional medical advice.

{{#if drugImageUri}}
A user has uploaded an image.
Image: {{media url=drugImageUri}}
Analyze this image. If it appears to be a medication, provide the following details for the 'drugIdentification' output field:
- name: The common or brand name of the drug.
- dosage: The dosage if visible or inferable (e.g., "10mg"). If not clear, state "Dosage not clear".
- purpose: A brief summary (1-2 sentences) of its primary medical purpose or what it's commonly used to treat. Then, list 1-2 general, actionable pieces of advice related to its use (e.g., "take with food if stomach upset occurs", "store in a cool, dry place", "avoid alcohol if it causes drowsiness").
- confidence: Your confidence in this identification (High, Medium, or Low).
If the image is not a drug, or you cannot confidently identify it, set the 'drugIdentification.error' field appropriately (e.g., "Image does not appear to be a medication." or "Could not confidently identify the drug."). Do not attempt to identify non-medical items.
{{/if}}

{{#if question}}
The user has also asked the following health question:
"{{{question}}}"
For the 'healthAnswer' output field:
1. Provide a brief and informative summary (1-3 sentences maximum) in response to the question.
2. Then, list 2-4 actionable, general self-care tips or steps the user might consider related to their query (e.g., "Things you might consider:", "General self-care tips:", "When to see a doctor:").
If the question is not health-related or outside your scope, politely state that you cannot answer it.
{{/if}}

If only a general health question is provided, focus on answering that.
If only a drug image is provided, focus on identifying the drug.
If both are provided, address both aspects in your response.

Your response for 'healthAnswer' or 'drugIdentification.purpose' should be informative but general and brief.
Finally, **always** include the following reminder in the 'generalAdvice' output field: "This information is for general knowledge and informational purposes only, and does not constitute medical advice. It is essential to consult with a qualified healthcare professional for any health concerns or before making any decisions related to your health or treatment."
Do not provide medical advice, diagnosis, or treatment recommendations.
`,
});

const healthAssistantFlow = ai.defineFlow(
  {
    name: 'healthAssistantFlow',
    inputSchema: HealthAssistantInputSchema,
    outputSchema: HealthAssistantOutputSchema,
  },
  async input => {
    if (!input.question && !input.drugImageUri) {
        return {
            generalAdvice: "Please provide a health question or an image of a drug for me to assist you. This information is for general knowledge and informational purposes only, and does not constitute medical advice. It is essential to consult with a qualified healthcare professional for any health concerns or before making any decisions related to your health or treatment."
        };
    }
    const {output} = await prompt(input);
    // Ensure generalAdvice is always populated, even if the model forgets
    if (output && !output.generalAdvice) {
      output.generalAdvice = "This information is for general knowledge and informational purposes only, and does not constitute medical advice. It is essential to consult with a qualified healthcare professional for any health concerns or before making any decisions related to your health or treatment.";
    }
    return output!;
  }
);

