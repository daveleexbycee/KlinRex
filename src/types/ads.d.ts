// src/types/ads.d.ts

interface AdSenseWindow extends Window {
    adsbygoogle?: { [key: string]: unknown; push: (p: object) => void }[];
}
