// src/components/ai/FloatingAIButton.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function FloatingAIButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="default"
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 flex items-center justify-center"
          >
            <Link href="/ai-assistant">
              <Bot className="h-7 w-7" />
              <span className="sr-only">AI Assistant</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-primary text-primary-foreground">
          <p>AI Assistant</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
