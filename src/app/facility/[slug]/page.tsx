import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getFacilityBySlug,
  getFacilitiesByCity,
  SITE_URL,
  SITE_NAME,
  Facility,
} from '@/lib/db';
import { SidebarAd, InContentAd } from '@/components/AdUnit';
import { ThemeToggle } from '@/components/ThemeToggle';
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

// Simple service section with tags
function ServiceSection({ title, items, icon: Icon }: { title: string; items: string[]; icon: React.ElementType }) {
  if (!items || items.length === 0) return null;

  const tags = items
    .flatMap(item => item.split(';'))
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0 && tag.length < 80);

  if (tags.length === 0) return null;

  return (
    <div className="py-4 border-b border-border last:border-0">
      <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-3">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// Questions to ask
function QuestionsToAsk() {
  const questions = [
    "What treatment programs do you offer?",
    "Do you accept my insurance?",
    "What is the program length?",
    "Do you offer detox on-site?",
  ];

  return (
    <div className="bg-muted/30 rounded-xl border border-border p-4 mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-primary" />
        Questions to Ask
      </h3>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <span key={i} className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
            {q}
          </span>
        ))}
      </div>
    </div>
  );
}

// Crisis helpline
function CrisisHelpline() {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 p-4 mb-6">
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        <div className="p-2 bg-primary/10 rounded-full shrink-0">
          <AlertCircle className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-foreground">Need Immediate Help?</h2>
          <p className="text-sm text-muted-foreground">SAMHSA Helpline - Free, confidential, 24/7</p>
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

// Related facility card
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

  const relatedFacilities = await getFacilitiesByCity(facility.state, facility.city_slug, 6);
  const otherFacilities = relatedFacilities.filter(f => f.id !== facility.id).slice(0, 4);

  const addressParts = [facility.street1, facility.street2, facility.city, facility.state, facility.zip].filter(Boolean);
  const fullAddress = addressParts.join(', ');

  const mapsUrl = facility.latitude && facility.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${facility.latitude},${facility.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  const directionsUrl = facility.latitude && facility.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;

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
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">{SITE_NAME}</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/browse" className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors">
                Browse All
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="bg-muted/50 border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/${facility.state.toLowerCase()}`} className="hover:text-foreground transition-colors">
                {facility.state_name || facility.state}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/${facility.state.toLowerCase()}/${facility.city_slug}`} className="hover:text-foreground transition-colors">
                {facility.city}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground truncate max-w-[200px]">{facility.name}</span>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left spacer - matches right sidebar width for symmetry */}
            <div className="hidden lg:block lg:w-[300px] shrink-0" />

            {/* Main content area - centered between equal gaps */}
            <main className="flex-1 min-w-0">
              {/* Facility Header */}
              <header className="mb-6">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <FacilityTypeBadge type={facility.facility_type} />
                  {facility.name_alt && (
                    <span className="text-sm text-muted-foreground">AKA: {facility.name_alt}</span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{facility.name}</h1>
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  {fullAddress}
                </p>
              </header>

              {/* Contact & Location Card */}
              <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
                {/* Contact Info - Above map (primary actions) */}
                <div className="p-5 border-b border-border">
                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    {facility.phone && (
                      <a href={`tel:${facility.phone}`} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="font-medium">{facility.phone}</span>
                      </a>
                    )}
                    {facility.intake_phone && facility.intake_phone !== facility.phone && (
                      <a href={`tel:${facility.intake_phone}`} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                        <Phone className="w-4 h-4 text-secondary" />
                        <span className="font-medium">{facility.intake_phone}</span>
                        <span className="text-xs text-muted-foreground">Intake</span>
                      </a>
                    )}
                    {facility.hotline && (
                      <a href={`tel:${facility.hotline}`} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="font-medium">{facility.hotline}</span>
                        <span className="text-xs text-muted-foreground">24/7</span>
                      </a>
                    )}
                    {facility.website && (
                      <a href={facility.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                      <Navigation className="w-4 h-4 text-primary" />
                      <span className="font-medium">Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Interactive Map - Below contact info */}
                <div className="relative w-full h-[300px] bg-muted">
                  {facility.latitude && facility.longitude ? (
                    <>
                      <iframe
                        src={`https://maps.google.com/maps?q=${facility.latitude},${facility.longitude}&z=15&output=embed`}
                        className="w-full h-full"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Map showing ${facility.name}`}
                        allowFullScreen
                      />
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-3 right-3 bg-white dark:bg-slate-800 text-foreground px-3 py-1.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-shadow flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open in Maps
                      </a>
                    </>
                  ) : (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full flex flex-col items-center justify-center bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <MapPin className="w-10 h-10 text-primary mb-2" />
                      <span className="text-muted-foreground">View on Google Maps</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Services & Programs Card */}
              <div className="bg-card rounded-xl border border-border p-5 mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">Services & Programs</h2>

                <ServiceSection title="Type of Care" items={facility.type_of_care || []} icon={Heart} />
                <ServiceSection title="Service Settings" items={facility.service_settings || []} icon={Building2} />
                <ServiceSection title="Payment & Insurance" items={facility.payment_options || []} icon={CreditCard} />
                <ServiceSection title="Age Groups Served" items={facility.age_groups || []} icon={Users} />
                <ServiceSection title="Special Programs" items={facility.special_programs || []} icon={CheckCircle} />
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
                    <h2 className="text-lg font-semibold text-foreground">Other Facilities in {facility.city}</h2>
                    <Link
                      href={`/${facility.state.toLowerCase()}/${facility.city_slug}`}
                      className="text-sm text-primary hover:underline flex items-center gap-0.5"
                    >
                      View all <ChevronRight className="w-4 h-4" />
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
