// src/components/theme-toggle-button.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggleButton() {
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setEffectiveTheme(storedTheme);
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setEffectiveTheme(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [effectiveTheme, mounted]);

  const toggleTheme = () => {
    setEffectiveTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (!mounted) {
    // Render a placeholder to avoid hydration mismatch during initial server render vs client render
    // before useEffect runs.
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
        <Monitor className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {effectiveTheme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}
