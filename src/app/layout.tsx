import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { PWAInstallProvider } from '@/contexts/pwa-install-context';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const roboto_mono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
  weight: ['400', '700'], // Common weights for mono
});

export const metadata: Metadata = {
  title: 'KlinRex',
  description: 'KlinRex: Your personal health organizer.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png', 
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${roboto_mono.variable} antialiased`}>
        <AuthProvider>
          <PWAInstallProvider>
            <AppLayout>
              {children}
            </AppLayout>
            <Toaster />
          </PWAInstallProvider>
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
