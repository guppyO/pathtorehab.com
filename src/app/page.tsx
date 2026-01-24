import Link from 'next/link';
import { getAllStates, getTotalIndexableCount, SITE_NAME } from '@/lib/db';
import { SearchBar } from '@/components/SearchBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HeroAd, SidebarAd } from '@/components/AdUnit';
import { Footer } from '@/components/Footer';
import {
  Building2,
  MapPin,
  Phone,
  Heart,
  Shield,
  ChevronRight,
  Users,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// State card component
function StateCard({ code, name, slug, facilityCount }: { code: string; name: string; slug: string; facilityCount: number }) {
  return (
    <Link
      href={`/${slug}`}
      className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold">
          {code}
        </div>
        <div>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {facilityCount.toLocaleString()} facilities
          </p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}

// Feature card component
function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="p-6 bg-card rounded-xl border border-border">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export default async function HomePage() {
  const [states, totalFacilities] = await Promise.all([
    getAllStates(),
    getTotalIndexableCount(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">{SITE_NAME}</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/browse"
              className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse All
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.1),transparent_50%)]" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Find Your Path to{' '}
              <span className="text-primary">Recovery</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Search {totalFacilities.toLocaleString()}+ verified treatment centers across the United States.
              Free, confidential help for addiction and mental health.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <SearchBar
                searchType="states"
                placeholder="Search by state name..."
                className="w-full"
              />
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>{totalFacilities.toLocaleString()} Facilities</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>{states.length} States</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span>SAMHSA Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Ad */}
      <div className="container mx-auto px-4">
        <HeroAd />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* States Grid */}
          <div className="flex-1">
            {/* Features Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Why Use Path To Rehab?
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <FeatureCard
                  icon={Shield}
                  title="SAMHSA Verified Data"
                  description="All facilities are sourced from official SAMHSA databases, ensuring accuracy and legitimacy."
                />
                <FeatureCard
                  icon={Phone}
                  title="Direct Contact Info"
                  description="Get phone numbers and websites to contact facilities directly, no middlemen."
                />
                <FeatureCard
                  icon={Users}
                  title="Comprehensive Coverage"
                  description="Browse substance abuse, mental health, and combined treatment options nationwide."
                />
              </div>
            </section>

            {/* Browse by State */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Browse by State
                </h2>
                <Link
                  href="/browse"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {states.slice(0, 12).map((state) => (
                  <StateCard
                    key={state.id}
                    code={state.code}
                    name={state.name}
                    slug={state.slug}
                    facilityCount={state.facility_count}
                  />
                ))}
              </div>

              {states.length > 12 && (
                <div className="mt-6 text-center">
                  <Link
                    href="/browse"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    View All {states.length} States
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-[300px] shrink-0">
            <SidebarAd />

            {/* Help section */}
            <div className="mt-8 p-6 bg-secondary/5 rounded-xl border border-secondary/20">
              <Heart className="w-8 h-8 text-secondary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Need Help Now?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                SAMHSA National Helpline - free, confidential, 24/7, 365 days a year.
              </p>
              <a
                href="tel:1-800-662-4357"
                className="flex items-center justify-center gap-2 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
              >
                <Phone className="w-4 h-4" />
                1-800-662-4357
              </a>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Tap to call on mobile
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
