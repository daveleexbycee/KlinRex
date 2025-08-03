// src/hooks/use-pwa.ts
"use client";

import { useState, useEffect } from 'react';

export function usePwa() {
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    // This will only run on the client side
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsPwa(e.matches);
    };

    // Set initial state
    setIsPwa(mediaQuery.matches);

    // Add listener for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isPwa;
}
