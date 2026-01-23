import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getFacilityBySlug,
  getFacilitiesByCity,
  SITE_URL,
  Facility,
} from '@/lib/db';
import { SidebarAd, InContentAd } from '@/components/AdUnit';
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Building2,
  Users,
  CreditCard,
  Heart,
  ChevronRight,
  ExternalLink,
  Navigation,
  HelpCircle,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const facility = await getFacilityBySlug(resolvedParams.slug);

  if (!facility) {
    return {
      title: 'Facility Not Found',
    };
  }

  const title = `${facility.name} - ${facility.city}, ${facility.state}`;
  const description = `Find treatment at ${facility.name} in ${facility.city}, ${facility.state}. View services, payment options, and contact information for this ${facility.facility_type === 'SA' ? 'substance abuse' : facility.facility_type === 'MH' ? 'mental health' : 'treatment'} facility.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/facility/${facility.slug}`,
    },
    alternates: {
      canonical: `${SITE_URL}/facility/${facility.slug}`,
    },
  };
}

// Facility type badge
function FacilityTypeBadge({ type }: { type: string | null }) {
  const config = {
    SA: { label: 'Substance Abuse Treatment', color: 'bg-primary/10 text-primary' },
    MH: { label: 'Mental Health Services', color: 'bg-secondary/10 text-secondary' },
    HRSA: { label: 'Health Center', color: 'bg-accent/10 text-accent-foreground' },
  };
  const { label, color } = config[type as keyof typeof config] || { label: 'Treatment Center', color: 'bg-muted text-muted-foreground' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      <Building2 className="w-4 h-4" />
      {label}
    </span>
  );
}

// Service category display - Compact with proper tag splitting
function ServiceSection({ title, items, icon: Icon }: { title: string; items: string[]; icon: React.ElementType }) {
  if (!items || items.length === 0) return null;

  // Split semicolon-separated strings into individual tags and clean them up
  const tags = items
    .flatMap(item => item.split(';'))
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0 && tag.length < 80); // Filter out empty and overly long items

  if (tags.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-1.5 font-medium text-sm text-foreground">
        <Icon className="w-4 h-4 text-primary" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {tags.slice(0, 12).map((tag, i) => (
          <span
            key={i}
            className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
        {tags.length > 12 && (
          <span className="px-2 py-0.5 text-xs text-muted-foreground">
            +{tags.length - 12} more
          </span>
        )}
      </div>
    </div>
  );
}

// Location section - Clean, compact design without iframe
function FacilityLocation({ address, lat, lng }: { address: string; lat: number | null; lng: number | null }) {
  const mapsUrl = lat && lng
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const directionsUrl = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            Location
          </h2>
          <p className="text-sm text-muted-foreground">{address}</p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Navigation className="w-4 h-4" />
            Directions
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
          >
            <ExternalLink className="w-4 h-4" />
            View Map
          </a>
        </div>
      </div>
    </div>
  );
}

// Questions to ask section - Ultra compact
function QuestionsToAsk() {
  const questions = [
    "What treatment programs do you offer?",
    "Do you accept my insurance?",
    "What is the program length?",
    "Do you offer detox on-site?",
  ];

  return (
    <div className="bg-muted/30 rounded-xl border border-border p-4 mb-6">
      <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-primary" />
        Questions to Ask
      </h3>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, i) => (
          <span key={i} className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
            {question}
          </span>
        ))}
      </div>
    </div>
  );
}

// Crisis helpline banner - Compact
function CrisisHelpline() {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 p-4 mb-6">
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        <div className="p-2 bg-primary/10 rounded-full shrink-0">
          <AlertCircle className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-foreground">Need Immediate Help?</h2>
          <p className="text-sm text-muted-foreground">
            SAMHSA&apos;s National Helpline - Free, confidential, 24/7
          </p>
        </div>
        <a
          href="tel:1-800-662-4357"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shrink-0"
        >
          <Phone className="w-4 h-4" />
          1-800-662-4357
        </a>
      </div>
    </div>
  );
}

// Related facility card - Compact
function RelatedFacilityCard({ facility }: { facility: Facility }) {
  return (
    <Link
      href={`/facility/${facility.slug}`}
      className="block p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
    >
      <h3 className="font-medium text-foreground line-clamp-1 text-sm">{facility.name}</h3>
      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {facility.city}, {facility.state}
      </p>
    </Link>
  );
}

export default async function FacilityPage({ params }: PageProps) {
  const resolvedParams = await params;
  const facility = await getFacilityBySlug(resolvedParams.slug);

  if (!facility) {
    notFound();
  }

  // Get related facilities in the same city
  const relatedFacilities = await getFacilitiesByCity(facility.state, facility.city_slug, 6);
  const otherFacilities = relatedFacilities.filter(f => f.id !== facility.id).slice(0, 4);

  // Build address string
  const addressParts = [facility.street1, facility.street2, facility.city, facility.state, facility.zip].filter(Boolean);
  const fullAddress = addressParts.join(', ');

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: facility.name,
    description: `${facility.facility_type === 'SA' ? 'Substance abuse' : 'Mental health'} treatment facility in ${facility.city}, ${facility.state}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: [facility.street1, facility.street2].filter(Boolean).join(', '),
      addressLocality: facility.city,
      addressRegion: facility.state,
      postalCode: facility.zip,
      addressCountry: 'US',
    },
    ...(facility.phone && { telephone: facility.phone }),
    ...(facility.website && { url: facility.website }),
    ...(facility.latitude && facility.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: facility.latitude,
        longitude: facility.longitude,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="bg-muted/50 border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/${facility.state.toLowerCase()}`} className="hover:text-foreground transition-colors">
                {facility.state_name || facility.state}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                href={`/${facility.state.toLowerCase()}/${facility.city_slug}`}
                className="hover:text-foreground transition-colors"
              >
                {facility.city}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground truncate max-w-[200px]">{facility.name}</span>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content area */}
            <main className="flex-1 min-w-0">
              {/* Header */}
              <header className="mb-6">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <FacilityTypeBadge type={facility.facility_type} />
                  {facility.name_alt && (
                    <span className="text-sm text-muted-foreground">
                      AKA: {facility.name_alt}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {facility.name}
                </h1>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  {fullAddress}
                </p>
              </header>

              {/* Contact card - Compact */}
              <div className="bg-card rounded-xl border border-border p-4 mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Contact Information</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {facility.phone && (
                    <a
                      href={`tel:${facility.phone}`}
                      className="flex items-center gap-2.5 p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Main Phone</p>
                        <p className="font-medium text-foreground text-sm">{facility.phone}</p>
                      </div>
                    </a>
                  )}
                  {facility.intake_phone && (
                    <a
                      href={`tel:${facility.intake_phone}`}
                      className="flex items-center gap-2.5 p-3 bg-secondary/5 rounded-lg hover:bg-secondary/10 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-secondary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Intake Line</p>
                        <p className="font-medium text-foreground text-sm">{facility.intake_phone}</p>
                      </div>
                    </a>
                  )}
                  {facility.hotline && (
                    <a
                      href={`tel:${facility.hotline}`}
                      className="flex items-center gap-2.5 p-3 bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-xs text-muted-foreground">24/7 Hotline</p>
                        <p className="font-medium text-foreground text-sm">{facility.hotline}</p>
                      </div>
                    </a>
                  )}
                  {facility.website && (
                    <a
                      href={facility.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Website</p>
                        <p className="font-medium text-foreground text-sm truncate flex items-center gap-1">
                          Visit Website <ExternalLink className="w-3 h-3" />
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Location */}
              <FacilityLocation
                address={fullAddress}
                lat={facility.latitude}
                lng={facility.longitude}
              />

              {/* Services section */}
              <div className="bg-card rounded-xl border border-border p-4 mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Services & Programs</h2>
                <div className="space-y-4">
                  <ServiceSection
                    title="Type of Care"
                    items={facility.type_of_care || []}
                    icon={Heart}
                  />
                  <ServiceSection
                    title="Service Settings"
                    items={facility.service_settings || []}
                    icon={Building2}
                  />
                  <ServiceSection
                    title="Payment Options"
                    items={facility.payment_options || []}
                    icon={CreditCard}
                  />
                  <ServiceSection
                    title="Age Groups Served"
                    items={facility.age_groups || []}
                    icon={Users}
                  />
                  <ServiceSection
                    title="Special Programs"
                    items={facility.special_programs || []}
                    icon={Heart}
                  />
                </div>
              </div>

              {/* In-content ad */}
              <InContentAd />

              {/* Questions to Ask */}
              <QuestionsToAsk />

              {/* Crisis Helpline */}
              <CrisisHelpline />

              {/* Related facilities */}
              {otherFacilities.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-foreground">
                      Other Facilities in {facility.city}
                    </h2>
                    <Link
                      href={`/${facility.state.toLowerCase()}/${facility.city_slug}`}
                      className="text-sm text-primary hover:underline flex items-center gap-0.5"
                    >
                      View all
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {otherFacilities.map((f) => (
                      <RelatedFacilityCard key={f.id} facility={f} />
                    ))}
                  </div>
                </div>
              )}
            </main>

            {/* Sidebar */}
            <aside className="lg:w-[300px] shrink-0">
              <SidebarAd />
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
