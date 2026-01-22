import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getStateBySlug,
  getCitiesByState,
  getFacilitiesByState,
  SITE_NAME,
  SITE_URL,
} from '@/lib/db';
import { SearchBar } from '@/components/SearchBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SidebarAd, InContentAd } from '@/components/AdUnit';
import {
  ChevronRight,
  MapPin,
  Building2,
  Phone,
  Heart,
  Shield,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ state: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const state = await getStateBySlug(stateSlug);

  if (!state) {
    return { title: 'State Not Found' };
  }

  const title = `${state.name} Treatment Centers - Drug & Alcohol Rehab`;
  const description = `Find ${state.facility_count.toLocaleString()} addiction treatment and mental health facilities in ${state.name}. Browse rehab centers by city with verified SAMHSA data.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${state.slug}`,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/${state.slug}`,
    },
  };
}

// City card component
function CityCard({
  name,
  slug,
  stateSlug,
  facilityCount,
}: {
  name: string;
  slug: string;
  stateSlug: string;
  facilityCount: number;
}) {
  return (
    <Link
      href={`/${stateSlug}/${slug}`}
      className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        <MapPin className="w-5 h-5 text-primary" />
        <div>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {facilityCount} {facilityCount === 1 ? 'facility' : 'facilities'}
          </p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}

// Facility preview card
function FacilityPreviewCard({
  name,
  city,
  slug,
  phone,
  facilityType,
}: {
  name: string;
  city: string;
  slug: string;
  phone: string | null;
  facilityType: string | null;
}) {
  const typeLabel =
    facilityType === 'SA'
      ? 'Substance Abuse'
      : facilityType === 'MH'
        ? 'Mental Health'
        : 'Treatment Center';

  return (
    <Link
      href={`/facility/${slug}`}
      className="block p-4 bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all group"
    >
      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
        {name}
      </h3>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <MapPin className="w-4 h-4" />
        <span>{city}</span>
      </div>
      {phone && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Phone className="w-4 h-4" />
          <span>{phone}</span>
        </div>
      )}
      <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded">
        {typeLabel}
      </span>
    </Link>
  );
}

export default async function StatePage({ params }: PageProps) {
  const { state: stateSlug } = await params;
  const state = await getStateBySlug(stateSlug);

  if (!state) {
    notFound();
  }

  const [cities, topFacilities] = await Promise.all([
    getCitiesByState(state.code),
    getFacilitiesByState(state.code, 12),
  ]);

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Treatment Centers in ${state.name}`,
    description: `Addiction treatment and mental health facilities in ${state.name}`,
    numberOfItems: state.facility_count,
    itemListElement: topFacilities.slice(0, 10).map((facility, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'MedicalOrganization',
        name: facility.name,
        url: `${SITE_URL}/facility/${facility.slug}`,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      {/* Breadcrumbs */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link href="/browse" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{state.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg">
                {state.code}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {state.name} Treatment Centers
                </h1>
                <p className="text-muted-foreground">
                  Addiction & Mental Health Facilities
                </p>
              </div>
            </div>

            <p className="text-lg text-muted-foreground mb-6">
              Find {state.facility_count.toLocaleString()} verified treatment centers in {state.name}.
              Browse by city or search for specific facilities offering drug rehab, alcohol treatment,
              and mental health services.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl">
              <SearchBar
                placeholder={`Search treatment centers in ${state.name}...`}
                className="w-full"
              />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>{state.facility_count.toLocaleString()} Facilities</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>{cities.length} Cities</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span>SAMHSA Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Top Facilities Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Top Treatment Centers in {state.name}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topFacilities.map((facility) => (
                  <FacilityPreviewCard
                    key={facility.id}
                    name={facility.name}
                    city={facility.city}
                    slug={facility.slug}
                    phone={facility.phone}
                    facilityType={facility.facility_type}
                  />
                ))}
              </div>
            </section>

            {/* In-Content Ad */}
            <InContentAd />

            {/* Cities Section */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Browse {state.name} by City
              </h2>
              {cities.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cities.slice(0, 30).map((city) => (
                    <CityCard
                      key={city.id}
                      name={city.name}
                      slug={city.slug}
                      stateSlug={state.slug}
                      facilityCount={city.facility_count}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No cities found with treatment centers.</p>
              )}

              {cities.length > 30 && (
                <div className="mt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Showing 30 of {cities.length} cities with treatment centers
                  </p>
                  <Link
                    href={`/${state.slug}/cities`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    View All Cities
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
              <p className="text-sm text-muted-foreground mb-4">
                SAMHSA National Helpline is available 24/7, 365 days a year.
              </p>
              <a
                href="tel:1-800-662-4357"
                className="block text-center py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
              >
                Call 1-800-662-4357
              </a>
            </div>

            {/* State Info */}
            <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-4">About {state.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {state.name} has {state.facility_count.toLocaleString()} SAMHSA-verified treatment
                facilities offering substance abuse and mental health services. Find the right
                program for your needs by browsing facilities in your city or searching by name.
              </p>
              <Link
                href="/"
                className="text-primary hover:underline text-sm flex items-center gap-1"
              >
                View all states <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-foreground">{SITE_NAME}</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Helping people find the path to recovery with verified treatment center information.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/browse" className="hover:text-foreground transition-colors">Browse All</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://findtreatment.gov" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">SAMHSA FindTreatment.gov</a></li>
                <li><a href="tel:1-800-662-4357" className="hover:text-foreground transition-colors">National Helpline</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {SITE_NAME}. Data sourced from SAMHSA.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
