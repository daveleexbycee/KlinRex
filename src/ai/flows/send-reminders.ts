// src/ai/flows/send-reminders.ts
'use server';
/**
 * @fileOverview A backend flow to send medication reminders.
 * IMPORTANT: This flow must be triggered by a scheduler (e.g., a cron job) to run automatically.
 * It does not run on its own.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import type { MedicationItem } from '@/types';
import type { KlinRexUser } from '@/contexts/auth-context';


// Initialize Firebase Admin SDK
// This requires a service account key. You must generate this from your Firebase project settings
// and make it available as an environment variable.
if (getApps().length === 0) {
    try {
        const serviceAccount = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
        );
        initializeApp({
            credential: cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized.");
    } catch (e: any) {
        console.error("Could not initialize Firebase Admin SDK. Make sure FIREBASE_SERVICE_ACCOUNT_KEY is set.", e.message);
    }
}


interface UserProfile extends KlinRexUser {
    id: string; // The user's UID
}

const SendRemindersOutputSchema = z.object({
  success: z.boolean(),
  messagesSent: z.number(),
  errors: z.array(z.string()),
});

export async function sendMedicationReminders(): Promise<z.infer<typeof SendRemindersOutputSchema>> {
  return sendMedicationRemindersFlow();
}

/**
 * This is the main flow that sends reminders.
 * It needs to be triggered by an external scheduler (cron job).
 */
const sendMedicationRemindersFlow = ai.defineFlow(
  {
    name: 'sendMedicationRemindersFlow',
    outputSchema: SendRemindersOutputSchema,
  },
  async () => {
    
    if (getApps().length === 0) {
        const errorMsg = "Firebase Admin SDK not initialized. Cannot send reminders.";
        console.error(errorMsg);
        return { success: false, messagesSent: 0, errors: [errorMsg] };
    }

    const db = getFirestore();
    const messaging = getMessaging();
    let messagesSent = 0;
    const errors: string[] = [];

    try {
      // 1. Get all user profiles that have an FCM token.
      const profilesSnapshot = await db.collection("userProfiles").where('fcmToken', '!=', null).get();
      if (profilesSnapshot.empty) {
        console.log("No users with FCM tokens found.");
        return { success: true, messagesSent: 0, errors: [] };
      }

      const userProfiles: UserProfile[] = profilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));

      // 2. For each user, get their medications and check for reminders.
      for (const profile of userProfiles) {
        const medsSnapshot = await db.collection("users").doc(profile.id).collection("medications").get();
        if (medsSnapshot.empty) {
          continue; // No medications for this user
        }

        const medications = medsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicationItem));
        const today = new Date();

        for (const med of medications) {
          if (med.reminders) {
            // Check if the medication is active today
            const startDate = med.startDate ? parseISO(med.startDate) : startOfDay(today);
            const endDate = med.endDate ? parseISO(med.endDate) : endOfDay(today);
            
            if (isWithinInterval(today, { start: startOfDay(startDate), end: endOfDay(endDate) })) {
              // This medication is active today, send a notification.
              const payload = {
                notification: {
                  title: `Medication Reminder: ${med.name}`,
                  body: `It's time to take your medication: ${med.dosage} - ${med.frequency}.`,
                },
                token: profile.fcmToken!, // We know this exists from the initial query
              };

              try {
                await messaging.send(payload);
                messagesSent++;
                console.log(`Sent reminder for ${med.name} to user ${profile.id}`);
              } catch (error: any) {
                const errorMessage = `Failed to send notification to user ${profile.id}: ${error.message}`;
                console.error(errorMessage);
                errors.push(errorMessage);
                // Could add logic here to remove invalid tokens from the database.
              }
            }
          }
        }
      }

      console.log(`Reminder check complete. Sent ${messagesSent} messages.`);
      return { success: true, messagesSent, errors };

    } catch (error: any) {
      const errorMessage = `An unexpected error occurred: ${error.message}`;
      console.error(errorMessage);
      errors.push(errorMessage);
      return { success: false, messagesSent, errors };
    }
  }
);