// src/components/ai/FloatingAIButton.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// New "Medical Connection" icon component
export const MedicalConnectionIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 50 30" // Adjusted viewBox
    className={className || ''}
    fill="none" // Important for stroke animations
    stroke="currentColor" // Default stroke color
  >
    {/* Node 1 */}
    <circle cx="10" cy="15" r="5" fill="currentColor" />
    {/* Node 2 */}
    <circle cx="40" cy="15" r="5" fill="currentColor" />
    {/* Connecting Line - Animated */}
    <line
      x1="10"
      y1="15"
      x2="40"
      y2="15"
      strokeWidth="2.5" // Slightly thicker for better visibility
      className="medical-connection-line-animated"
    />
  </svg>
);


export function FloatingAIButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="default"
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300 ease-in-out hover:shadow-[0_0_18px_4px_hsl(var(--primary)/0.4)] hover:ring-2 hover:ring-[hsl(var(--primary)/0.6)]"
          >
            <Link href="/ai-assistant">
              <MedicalConnectionIcon className="h-7 w-7" />
              <span className="sr-only">KlinRex AI</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-primary text-primary-foreground">
          <p>KlinRex AI</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
