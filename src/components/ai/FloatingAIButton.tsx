// src/components/ai/FloatingAIButton.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Custom SVG "M" icon component
const DoodleMIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`rgb-glowing-m ${className || ''}`}
  >
    <path d="M4 18 C5.5 12 6.5 12 8 10 C9.5 8 10.5 12 12 14 C13.5 12 14.5 8 16 10 C17.5 12 18.5 12 20 18" />
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
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300 ease-in-out hover:ring-4 hover:ring-accent/60 hover:shadow-accent/30 hover:shadow-md"
          >
            <Link href="/ai-assistant">
              <DoodleMIcon className="h-7 w-7" />
              <span className="sr-only">MedRec AI</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-primary text-primary-foreground">
          <p>MedRec AI</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
