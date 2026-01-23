'use client';

// Ad placeholders - cleaner design
// Replace with actual AdSense code when configured

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

export function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  const height = format === 'rectangle' ? 'h-[250px]' : 'h-[90px]';
  return (
    <div
      className={`bg-muted/50 border border-dashed border-border rounded-lg flex items-center justify-center ${height} ${className}`}
      data-ad-slot={slot}
      data-ad-format={format}
    >
      <span className="text-xs text-muted-foreground">Advertisement</span>
    </div>
  );
}

export function SidebarAd() {
  return (
    <div className="hidden lg:block sticky top-[100px]">
      <AdUnit slot="sidebar-1" format="rectangle" className="w-[300px]" />
    </div>
  );
}

export function InContentAd() {
  return (
    <div className="my-4">
      <AdUnit slot="in-content-1" format="horizontal" className="w-full" />
    </div>
  );
}

export function HeroAd() {
  return (
    <div className="my-4">
      <AdUnit slot="hero-below-1" format="horizontal" className="w-full" />
    </div>
  );
}
