import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getStateBySlug,
  getCityBySlug,
  getFacilitiesByCity,
  SITE_NAME,
  SITE_URL,
} from '@/lib/db';
import { SearchBar } from '@/components/SearchBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SidebarAd, InContentAd } from '@/components/AdUnit';
import { Footer } from '@/components/Footer';
import {
  ChevronRight,
  MapPin,
  Building2,
  Phone,
  Heart,
  Shield,
  Globe,
  ExternalLink,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ state: string; city: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: stateSlug, city: citySlug } = await params;
  const state = await getStateBySlug(stateSlug);
  if (!state) return { title: 'Not Found' };

  const city = await getCityBySlug(state.code, citySlug);
  if (!city) return { title: 'City Not Found' };

  const title = `${city.name}, ${state.code} Treatment Centers - Drug & Alcohol Rehab`;
  const description = `Find ${city.facility_count} addiction treatment and mental health facilities in ${city.name}, ${state.name}. Browse rehab centers with verified SAMHSA data, contact info, and services.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${state.slug}/${city.slug}`,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/${state.slug}/${city.slug}`,
    },
  };
}

// Facility card component
function FacilityCard({
  name,
  slug,
  street1,
  phone,
  website,
  facilityType,
  typeOfCare,
  paymentOptions,
}: {
  name: string;
  slug: string;
  street1: string | null;
  phone: string | null;
  website: string | null;
  facilityType: string | null;
  typeOfCare: string[] | null;
  paymentOptions: string[] | null;
}) {
  const typeLabel =
    facilityType === 'SA'
      ? 'Substance Abuse'
      : facilityType === 'MH'
        ? 'Mental Health'
        : 'Treatment Center';

  return (
    <div className="p-5 bg-card rounded-xl border border-border hover:border-primary/30 transition-all">
      <Link href={`/facility/${slug}`}>
        <h3 className="font-semibold text-lg text-foreground hover:text-primary transition-colors mb-3 line-clamp-2">
          {name}
        </h3>
      </Link>

      {street1 && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{street1}</span>
        </div>
      )}

      {phone && (
        <div className="flex items-center gap-2 text-sm mb-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <a
            href={`tel:${phone}`}
            className="text-primary hover:underline"
          >
            {phone}
          </a>
        </div>
      )}

      {website && (
        <div className="flex items-center gap-2 text-sm mb-3">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <a
            href={website.startsWith('http') ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
          >
            Visit Website
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
          {typeLabel}
        </span>
        {typeOfCare?.slice(0, 2).map((care) => (
          <span key={care} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
            {care}
          </span>
        ))}
      </div>

      {/* Payment */}
      {paymentOptions && paymentOptions.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Accepts:</span>{' '}
          {paymentOptions.slice(0, 3).join(', ')}
          {paymentOptions.length > 3 && ` +${paymentOptions.length - 3} more`}
        </div>
      )}

      <Link
        href={`/facility/${slug}`}
        className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        View Details <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default async function CityPage({ params }: PageProps) {
  const { state: stateSlug, city: citySlug } = await params;

  const state = await getStateBySlug(stateSlug);
  if (!state) {
    notFound();
  }

  const city = await getCityBySlug(state.code, citySlug);
  if (!city) {
    notFound();
  }

  const facilities = await getFacilitiesByCity(state.code, city.slug, 100);

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Treatment Centers in ${city.name}, ${state.code}`,
    description: `Addiction treatment and mental health facilities in ${city.name}, ${state.name}`,
    numberOfItems: facilities.length,
    itemListElement: facilities.slice(0, 10).map((facility, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'MedicalOrganization',
        name: facility.name,
        url: `${SITE_URL}/facility/${facility.slug}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: facility.street1,
          addressLocality: city.name,
          addressRegion: state.code,
          postalCode: facility.zip,
        },
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
          <nav className="flex items-center gap-2 text-sm flex-wrap">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link href="/browse" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link
              href={`/${state.slug}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {state.name}
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{city.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Treatment Centers in {city.name}, {state.code}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Find {city.facility_count} verified addiction treatment and mental health facilities
              in {city.name}, {state.name}. All facilities are SAMHSA-verified with direct contact
              information.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl">
              <SearchBar
                placeholder={`Search facilities in ${city.name}...`}
                className="w-full"
                stateCode={state.code}
                stateSlug={state.slug}
                citySlug={city.slug}
              />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>{city.facility_count} Facilities</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>{city.name}, {state.code}</span>
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
          {/* Facilities List */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              All Treatment Centers in {city.name}
            </h2>

            {facilities.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {facilities.slice(0, 10).map((facility) => (
                    <FacilityCard
                      key={facility.id}
                      name={facility.name}
                      slug={facility.slug}
                      street1={facility.street1}
                      phone={facility.phone}
                      website={facility.website}
                      facilityType={facility.facility_type}
                      typeOfCare={facility.type_of_care}
                      paymentOptions={facility.payment_options}
                    />
                  ))}
                </div>

                {facilities.length > 10 && (
                  <>
                    {/* In-Content Ad */}
                    <InContentAd />

                    <div className="grid gap-4 sm:grid-cols-2">
                      {facilities.slice(10).map((facility) => (
                        <FacilityCard
                          key={facility.id}
                          name={facility.name}
                          slug={facility.slug}
                          street1={facility.street1}
                          phone={facility.phone}
                          website={facility.website}
                          facilityType={facility.facility_type}
                          typeOfCare={facility.type_of_care}
                          paymentOptions={facility.payment_options}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-xl">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No treatment centers found in {city.name}.
                </p>
                <Link
                  href={`/${state.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Browse other cities in {state.name}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
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

            {/* Browse More */}
            <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-4">More Locations</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href={`/${state.slug}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    All cities in {state.name}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/browse"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    Browse all states
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
