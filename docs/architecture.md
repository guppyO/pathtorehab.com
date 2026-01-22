# PathToRehab.com - Architecture Document

## Overview
- **Domain**: pathtorehab.com
- **Niche**: Treatment Facility Directory (Addiction + Mental Health)
- **Data Source**: SAMHSA FindTreatment.gov API
- **Total Records**: ~98,000 facilities
- **Rendering**: `force-dynamic` (required for 98K+ pages)

---

## 1. Data Source Analysis

### API Endpoint
```
GET https://findtreatment.gov/locator/exportsAsJson/v2
```

### API Parameters
| Parameter | Description | Example |
|-----------|-------------|---------|
| sAddr | Search address | "Los Angeles CA" |
| limitType | Distance unit (2=meters) | 2 |
| limitValue | Distance in meters | 50000 |
| pageSize | Results per page | 100 |
| page | Page number (1-indexed) | 1 |
| sCodes | Service codes filter | "OTP,BU,NU" |

### Response Schema
```json
{
  "page": 1,
  "totalPages": 980,
  "recordCount": 98000,
  "rows": [
    {
      "_irow": 1,
      "name1": "Facility Name",
      "name2": "DBA Name",
      "street1": "123 Main St",
      "street2": "Suite 100",
      "city": "Los Angeles",
      "state": "CA",
      "zip": "90001",
      "phone": "555-123-4567",
      "intake1": "555-123-4568",
      "hotline1": "800-555-0000",
      "website": "https://example.com",
      "latitude": "34.052235",
      "longitude": "-118.243683",
      "typeFacility": "SA",
      "services": [
        {
          "f1": "Category Name",
          "f2": "CODE",
          "f3": "Detailed values"
        }
      ]
    }
  ]
}
```

### Facility Types (typeFacility)
| Code | Description |
|------|-------------|
| SA | Substance Abuse Treatment |
| MH | Mental Health Treatment |
| HRSA | Health Resources (general) |

### Service Categories (f2 codes)
| Code | Category | Use Case |
|------|----------|----------|
| TC | Type of Care | Filter by treatment type |
| SET | Service Setting | Outpatient/Residential/Inpatient |
| FT | Facility Type | Clinic type classification |
| PHR | Pharmacotherapies | Medications offered |
| TAP | Treatment Approaches | Therapy methods |
| FOP | Facility Operation | Public/Private/Non-profit |
| PAY | Payment Accepted | Insurance/payment methods |
| SG | Special Programs | Target populations |
| ECS | Education/Counseling | Additional services |
| AGE | Age Groups | Children/Adults/Seniors |
| AS | Ancillary Services | Support services |

---

## 2. Database Schema

### Tables

#### `facilities` (Main Entity)
```sql
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE,  -- API _irow for deduplication
  name TEXT NOT NULL,
  name_alt TEXT,
  slug TEXT UNIQUE NOT NULL,

  -- Address
  street1 TEXT,
  street2 TEXT,
  city TEXT NOT NULL,
  city_slug TEXT NOT NULL,
  state TEXT NOT NULL,      -- 2-letter code
  state_name TEXT NOT NULL, -- Full name
  zip TEXT,

  -- Contact
  phone TEXT,
  intake_phone TEXT,
  hotline TEXT,
  website TEXT,

  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Classification
  facility_type TEXT,       -- SA, MH, HRSA

  -- Services (denormalized JSON for fast reads)
  services JSONB,

  -- Extracted filters (for indexing)
  type_of_care TEXT[],      -- ['Substance use', 'Mental health', 'Co-occurring']
  service_settings TEXT[],  -- ['Outpatient', 'Residential', 'Inpatient']
  payment_options TEXT[],   -- ['Medicare', 'Medicaid', 'Private insurance']
  age_groups TEXT[],        -- ['Children', 'Adults', 'Seniors']
  special_programs TEXT[],  -- ['Veterans', 'LGBTQ+', 'Pregnant women']

  -- Quality
  dqs DECIMAL(3, 2),        -- Data Quality Score (0.00-1.00)
  is_indexable BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for filtering
CREATE INDEX idx_facilities_state ON facilities(state);
CREATE INDEX idx_facilities_city_slug ON facilities(city_slug);
CREATE INDEX idx_facilities_slug ON facilities(slug);
CREATE INDEX idx_facilities_facility_type ON facilities(facility_type);
CREATE INDEX idx_facilities_type_of_care ON facilities USING GIN(type_of_care);
CREATE INDEX idx_facilities_service_settings ON facilities USING GIN(service_settings);
CREATE INDEX idx_facilities_payment_options ON facilities USING GIN(payment_options);
CREATE INDEX idx_facilities_location ON facilities(latitude, longitude);
CREATE INDEX idx_facilities_indexable ON facilities(is_indexable) WHERE is_indexable = true;
```

#### `states` (Hub Pages)
```sql
CREATE TABLE states (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,     -- 'CA'
  name TEXT NOT NULL,            -- 'California'
  slug TEXT UNIQUE NOT NULL,     -- 'california'
  facility_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `cities` (Sub-Hub Pages)
```sql
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  state_code TEXT NOT NULL REFERENCES states(code),
  facility_count INTEGER DEFAULT 0,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, state_code)
);

CREATE INDEX idx_cities_state ON cities(state_code);
CREATE INDEX idx_cities_slug ON cities(slug);
```

---

## 3. Route Architecture

```
/                                   -> Homepage (search + featured)
|
+-- /browse                         -> Master hub (all states)
|   +-- /browse/treatment-types     -> Treatment type hub
|   +-- /browse/payment-options     -> Payment options hub
|   +-- /browse/special-programs    -> Special programs hub
|
+-- /[state]                        -> State hub (e.g., /california)
|   +-- /[state]/[city]             -> City page (e.g., /california/los-angeles)
|
+-- /facility/[slug]                -> Entity page (MONEY PAGE)
|
+-- /treatment/[type]               -> Treatment type pages
|   +-- /treatment/substance-abuse
|   +-- /treatment/mental-health
|   +-- /treatment/opioid-treatment
|
+-- /accepts/[payment]              -> Payment filter pages
|   +-- /accepts/medicaid
|   +-- /accepts/medicare
|   +-- /accepts/private-insurance
|
+-- /programs/[program]             -> Special programs pages
|   +-- /programs/veterans
|   +-- /programs/lgbtq
|   +-- /programs/pregnant-women
|
+-- /compare/[a]-vs-[b]             -> Facility comparison
|
+-- /search                         -> Search results page
|
+-- /about                          -> About page
+-- /contact                        -> Contact page
+-- /privacy                        -> Privacy policy
+-- /terms                          -> Terms of service
```

---

## 4. Page Taxonomy

| Page Type | URL Pattern | Quality Gate | Est. Count |
|-----------|-------------|--------------|------------|
| **Facility** | `/facility/[slug]` | 5+ data points, DQS ≥ 0.7 | ~80,000 |
| **State Hub** | `/[state]` | 10+ facilities | 56 |
| **City Page** | `/[state]/[city]` | 3+ facilities | ~5,000 |
| **Treatment Type** | `/treatment/[type]` | 100+ facilities | 10 |
| **Payment Hub** | `/accepts/[payment]` | 100+ facilities | 8 |
| **Program Hub** | `/programs/[program]` | 50+ facilities | 15 |
| **Browse Hub** | `/browse/*` | 20+ links | 5 |
| **Comparison** | `/compare/[a]-vs-[b]` | On-demand | Dynamic |
| **Static** | `/about`, `/privacy`, etc. | N/A | 5 |

**Total Estimated Pages**: ~85,000+

---

## 5. Rendering Strategy

| Page Type | Strategy | Reason |
|-----------|----------|--------|
| Facility pages | `force-dynamic` | 80K+ pages, would timeout SSG |
| State hubs | `force-dynamic` | Dynamic counts |
| City pages | `force-dynamic` | 5K+ pages |
| Treatment/Payment hubs | `force-dynamic` | Dynamic filtering |
| Static pages | SSG | Few pages, rarely change |

### Implementation
```typescript
// src/app/facility/[slug]/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

---

## 6. Internal Link Architecture

```
                        [Homepage]
                            |
            +-------+-------+-------+-------+
            |       |       |       |       |
        [Browse] [States] [Types] [Payment] [Programs]
            |       |       |       |       |
        +---+   +---+---+   |       |       |
        |       |   |   |   |       |       |
      [Hub]   [CA][TX][NY] [SA]   [Medicaid] [Vets]
              /|\
         +---+-+---+
         |   |   |
       [LA][SF][SD]
         |
    +----+----+
    |    |    |
  [F1] [F2] [F3]  <- Facility Pages
```

### Link Requirements
1. **Every page reachable via HTML links** (no JS-only navigation)
2. **Breadcrumbs on every page**: Home > California > Los Angeles > Facility Name
3. **Hub pages link to ALL children** (paginated if >50)
4. **Facility pages link to**:
   - Same-city facilities ("Nearby Facilities")
   - Same-type facilities ("Similar Programs")
   - State hub (breadcrumb)
5. **Descriptive anchor text**: "Drug rehab centers in Los Angeles" not "click here"

---

## 7. SEO Structure

### URL Patterns
- State: `/california` (not `/state/ca`)
- City: `/california/los-angeles` (hyphenated, lowercase)
- Facility: `/facility/sunrise-recovery-center-los-angeles` (name + city for uniqueness)

### Title Templates
| Page Type | Template |
|-----------|----------|
| Facility | `{Name} - Rehab Center in {City}, {State} | PathToRehab` |
| State | `Drug & Alcohol Rehab Centers in {State} | PathToRehab` |
| City | `Rehab Centers in {City}, {State} - {Count} Options | PathToRehab` |
| Treatment | `{Type} Treatment Centers Near You | PathToRehab` |

### Meta Description Templates
| Page Type | Template |
|-----------|----------|
| Facility | `Find help at {Name} in {City}, {State}. {Type of Care}. Call {Phone}. {Payment options}.` |
| State | `Compare {Count}+ rehab centers in {State}. Find addiction & mental health treatment. Free search.` |

---

## 8. Data Quality Score (DQS)

```typescript
function calculateDQS(facility: Facility): number {
  let score = 0;

  // Fields filled (40%)
  const fields = ['name', 'street1', 'city', 'state', 'zip', 'phone', 'website', 'latitude', 'longitude', 'services'];
  const filled = fields.filter(f => facility[f]).length;
  score += (filled / fields.length) * 0.4;

  // Has unique content (30%) - services array with details
  if (facility.services?.length > 3) score += 0.3;
  else if (facility.services?.length > 0) score += 0.15;

  // Has location data (20%)
  if (facility.latitude && facility.longitude) score += 0.2;

  // Has contact data (10%)
  if (facility.phone || facility.website) score += 0.1;

  return Math.round(score * 100) / 100;
}

// Indexability rule: DQS >= 0.7
```

---

## 9. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| Components | magic-ui (queried fresh) |
| Database | Supabase (PostgreSQL) |
| DB Client | @supabase/supabase-js (NOT pg) |
| Hosting | Vercel |
| Search | Built-in (Supabase full-text) |

---

## 10. File Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Homepage
│   ├── browse/
│   │   └── page.tsx                # Browse hub
│   ├── [state]/
│   │   ├── page.tsx                # State hub
│   │   └── [city]/
│   │       └── page.tsx            # City page
│   ├── facility/
│   │   └── [slug]/
│   │       └── page.tsx            # Facility page (MONEY PAGE)
│   ├── treatment/
│   │   └── [type]/
│   │       └── page.tsx            # Treatment type pages
│   ├── accepts/
│   │   └── [payment]/
│   │       └── page.tsx            # Payment filter pages
│   ├── programs/
│   │   └── [program]/
│   │       └── page.tsx            # Special programs pages
│   ├── search/
│   │   └── page.tsx                # Search results
│   ├── compare/
│   │   └── [...slugs]/
│   │       └── page.tsx            # Comparison page
│   └── sitemap/
│       └── [id]/
│           └── route.ts            # Custom sitemap (NOT generateSitemaps)
├── components/
│   ├── ui/                         # magic-ui components
│   ├── facility-card.tsx
│   ├── search-autocomplete.tsx
│   ├── breadcrumbs.tsx
│   ├── theme-toggle.tsx
│   └── ad-slot.tsx
├── lib/
│   ├── db.ts                       # Supabase client
│   ├── queries.ts                  # Database queries
│   └── utils.ts                    # Helpers
└── types/
    └── facility.ts                 # TypeScript types
```

---

## Phase 2 Complete

**Checkpoint Summary:**
- Schema: facilities, states, cities (3 tables)
- Routes: 8 page types
- Total pages estimate: ~85,000+
- Rendering: force-dynamic (required for scale)
