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

// Service category display - Compact
function ServiceSection({ title, items, icon: Icon }: { title: string; items: string[]; icon: React.ElementType }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-1.5 font-medium text-sm text-foreground">
        <Icon className="w-4 h-4 text-primary" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className="px-2.5 py-1 bg-muted rounded-md text-xs text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// Google Maps component - Compact version
function FacilityMap({ address, lat, lng, name }: { address: string; lat: number | null; lng: number | null; name: string }) {
  // Use coordinates if available, otherwise use address
  const query = lat && lng
    ? `${lat},${lng}`
    : encodeURIComponent(address);

  const mapUrl = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden mb-8">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Location
        </h2>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Navigation className="w-3.5 h-3.5" />
          Directions
        </a>
      </div>
      <div className="aspect-[2/1] md:aspect-[3/1] max-h-[200px]">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map showing location of ${name}`}
          className="w-full h-full"
        />
      </div>
      <div className="px-3 py-2 bg-muted/30 flex items-center justify-between">
        <p className="text-sm text-muted-foreground truncate">{address}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${query}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline shrink-0 ml-2"
        >
          Open in Maps
        </a>
      </div>
    </div>
  );
}

// Questions to ask section - Compact
function QuestionsToAsk() {
  const questions = [
    "What types of treatment programs do you offer?",
    "Do you accept my insurance? What are the out-of-pocket costs?",
    "What is the length of your treatment program?",
    "What credentials do your staff members have?",
    "Do you offer detox services on-site?",
    "What is your approach to treatment (12-step, holistic, etc.)?",
    "Do you offer family therapy or involvement in treatment?",
    "What aftercare support do you provide?",
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-primary" />
        Questions to Ask When You Call
      </h2>
      <p className="text-sm text-muted-foreground mb-3">
        Consider asking these questions when you contact this facility:
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {questions.map((question, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="text-foreground">{question}</span>
          </li>
        ))}
      </ul>
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

              {/* Location Map */}
              <FacilityMap
                address={fullAddress}
                lat={facility.latitude}
                lng={facility.longitude}
                name={facility.name}
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
