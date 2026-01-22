'use client';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

export function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  return (
    <div
      className={`bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm ${className}`}
      style={{ minHeight: format === 'rectangle' ? '250px' : '90px' }}
      data-ad-slot={slot}
      data-ad-format={format}
    >
      <span>Ad Space</span>
    </div>
  );
}

export function SidebarAd() {
  return (
    <div className="hidden lg:block sticky top-4">
      <AdUnit slot="sidebar-1" format="rectangle" className="w-[300px] h-[250px]" />
    </div>
  );
}

export function InContentAd() {
  return (
    <div className="my-8">
      <AdUnit slot="in-content-1" format="horizontal" className="w-full h-[90px] lg:h-[250px]" />
    </div>
  );
}

export function HeroAd() {
  return (
    <div className="my-6">
      <AdUnit slot="hero-below-1" format="horizontal" className="w-full h-[90px] lg:h-[90px]" />
    </div>
  );
}
