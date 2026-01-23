'use client';

// Ad placeholders - hidden until real AdSense is configured
// To enable: set NEXT_PUBLIC_ADSENSE_ID in .env and uncomment the ad code

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

export function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  // Hidden until AdSense is configured
  // When ready, replace with actual Google AdSense code
  return null;
}

export function SidebarAd() {
  // Hidden until AdSense is configured
  return null;
}

export function InContentAd() {
  // Hidden until AdSense is configured
  return null;
}

export function HeroAd() {
  // Hidden until AdSense is configured
  return null;
}
