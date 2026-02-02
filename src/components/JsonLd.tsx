/**
 * JSON-LD Structured Data Components for Path to Rehab
 *
 * Schema.org markup for enhanced search results and rich snippets
 */

interface WebsiteJsonLdProps {
  url: string;
  name: string;
  description: string;
}

/**
 * Website-level structured data (for homepage)
 */
export function WebsiteJsonLd({ url, name, description }: WebsiteJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    description,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/browse?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface TreatmentFacilityJsonLdProps {
  name: string;
  description: string;
  address: {
    street?: string;
    city: string;
    state: string;
    zip?: string;
  };
  telephone?: string;
  url: string;
  latitude?: number | null;
  longitude?: number | null;
  services?: string[];
  facilityType?: string;
}

/**
 * Treatment facility structured data
 */
export function TreatmentFacilityJsonLd({
  name,
  description,
  address,
  telephone,
  url,
  latitude,
  longitude,
  services,
  facilityType,
}: TreatmentFacilityJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@additionalType': 'https://schema.org/RehabilitationCenter',
    name,
    description,
    address: {
      '@type': 'PostalAddress',
      ...(address.street && { streetAddress: address.street }),
      addressLocality: address.city,
      addressRegion: address.state,
      ...(address.zip && { postalCode: address.zip }),
      addressCountry: 'US',
    },
    ...(telephone && { telephone }),
    ...(latitude && longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude,
        longitude,
      },
    }),
    ...(services && services.length > 0 && {
      availableService: services.slice(0, 10).map(service => ({
        '@type': 'MedicalTherapy',
        name: service,
      })),
    }),
    ...(facilityType && {
      medicalSpecialty: facilityType === 'SA' ? 'Substance Abuse Treatment'
        : facilityType === 'MH' ? 'Mental Health Services'
        : 'Rehabilitation Services',
    }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Breadcrumb structured data
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface FAQJsonLdProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

/**
 * FAQ structured data (for pages with FAQ sections)
 */
export function FAQJsonLd({ questions }: FAQJsonLdProps) {
  if (!questions || questions.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
