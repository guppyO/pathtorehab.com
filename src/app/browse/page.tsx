import { Metadata } from 'next';
import Link from 'next/link';
import { getAllStates, getTotalIndexableCount, SITE_NAME, SITE_URL } from '@/lib/db';
import { SearchBar } from '@/components/SearchBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SidebarAd } from '@/components/AdUnit';
import {
  ChevronRight,
  MapPin,
  Building2,
  Heart,
  Shield,
  Filter,
  Phone,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Browse Treatment Centers by State - Drug & Alcohol Rehab Directory',
  description:
    'Browse addiction treatment and mental health facilities across all 50 states. Find SAMHSA-verified rehab centers with direct contact information.',
  openGraph: {
    title: 'Browse Treatment Centers by State',
    description:
      'Browse addiction treatment and mental health facilities across all 50 states.',
    url: `${SITE_URL}/browse`,
    siteName: SITE_NAME,
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_URL}/browse`,
  },
};

// State card component
function StateCard({
  code,
  name,
  slug,
  facilityCount,
}: {
  code: string;
  name: string;
  slug: string;
  facilityCount: number;
}) {
  return (
    <Link
      href={`/${slug}`}
      className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
          {code}
        </div>
        <div>
          <h2 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {facilityCount.toLocaleString()} facilities
          </p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}

// Region groupings
const regions: Record<string, string[]> = {
  Northeast: ['CT', 'ME', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT'],
  Southeast: ['AL', 'AR', 'FL', 'GA', 'KY', 'LA', 'MS', 'NC', 'SC', 'TN', 'VA', 'WV'],
  Midwest: ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI'],
  Southwest: ['AZ', 'NM', 'OK', 'TX'],
  West: ['AK', 'CA', 'CO', 'HI', 'ID', 'MT', 'NV', 'OR', 'UT', 'WA', 'WY'],
  Territories: ['AS', 'GU', 'MP', 'PR', 'VI', 'DC'],
};

export default async function BrowsePage() {
  const [states, totalFacilities] = await Promise.all([
    getAllStates(),
    getTotalIndexableCount(),
  ]);

  // Group states by region
  const statesByRegion: Record<string, typeof states> = {};
  for (const [region, codes] of Object.entries(regions)) {
    statesByRegion[region] = states.filter((s) => codes.includes(s.code));
  }

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Treatment Centers by State',
    description: 'Browse addiction treatment facilities across all US states',
    numberOfItems: states.length,
    itemListElement: states.map((state, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'State',
        name: state.name,
        url: `${SITE_URL}/${state.slug}`,
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
            <span className="text-foreground font-medium">Browse</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Browse Treatment Centers by State
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Explore {totalFacilities.toLocaleString()} verified addiction treatment and mental
              health facilities across {states.length} states and territories. All data is sourced
              from SAMHSA.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl">
              <SearchBar
                placeholder="Search by facility name, city, or state..."
                className="w-full"
              />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>{totalFacilities.toLocaleString()} Total Facilities</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>{states.length} States & Territories</span>
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
          {/* States by Region */}
          <div className="flex-1">
            {/* Quick Jump */}
            <div className="mb-8 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Jump to Region:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(regions).map((region) => (
                  <a
                    key={region}
                    href={`#${region.toLowerCase()}`}
                    className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                  >
                    {region}
                  </a>
                ))}
              </div>
            </div>

            {/* All States */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">All States A-Z</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {states.map((state) => (
                  <StateCard
                    key={state.id}
                    code={state.code}
                    name={state.name}
                    slug={state.slug}
                    facilityCount={state.facility_count}
                  />
                ))}
              </div>
            </section>

            {/* By Region */}
            {Object.entries(statesByRegion).map(([region, regionStates]) => (
              regionStates.length > 0 && (
                <section key={region} id={region.toLowerCase()} className="mb-8 scroll-mt-24">
                  <h2 className="text-xl font-bold text-foreground mb-4">{region}</h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {regionStates.map((state) => (
                      <StateCard
                        key={state.id}
                        code={state.code}
                        name={state.name}
                        slug={state.slug}
                        facilityCount={state.facility_count}
                      />
                    ))}
                  </div>
                </section>
              )
            ))}
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

            {/* About */}
            <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-3">About Our Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                All treatment facility data is sourced from SAMHSA (Substance Abuse and Mental
                Health Services Administration), ensuring accuracy and legitimacy.
              </p>
              <p className="text-sm text-muted-foreground">
                We display facilities that meet our data quality standards, including verified
                contact information and service details.
              </p>
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
                <li><Link href="/browse" className="hover:text-foreground transition-colors">Browse All States</Link></li>
                <li><Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link></li>
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
