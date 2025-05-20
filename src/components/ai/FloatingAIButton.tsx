// src/components/ai/FloatingAIButton.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Custom "ΔΣ" icon component
const DeltaSigmaIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 40 24" 
    className={`delta-sigma-container ${className || ''}`}
  >
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize="26" // Adjusted for ~1.6rem, assuming 1rem = 16px
      className="delta-sigma-text-animated" 
    >
      ΔΣ
    </text>
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
              <DeltaSigmaIcon className="h-7 w-7" /> {/* Container size, SVG text size controls actual logo */}
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
