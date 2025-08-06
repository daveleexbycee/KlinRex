
// src/app/api/cron/send-reminders/route.ts
import { NextResponse } from 'next/server';
import { sendMedicationReminders } from '@/ai/flows/send-reminders';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: Request) {
  
  const headersList = headers();
  const authorization = headersList.get('authorization');
  
  if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log("Cron job starting: sendMedicationReminders");
    const result = await sendMedicationReminders();
    console.log("Cron job finished. Result:", result);
    
    if (result.success) {
      return NextResponse.json({ message: `Successfully sent ${result.messagesSent} reminders.`, details: result });
    } else {
      return NextResponse.json({ message: 'Cron job executed with errors.', details: result }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error("Error executing cron job:", error);
    return NextResponse.json({ error: 'Failed to execute cron job', details: error.message }, { status: 500 });
  }
}
