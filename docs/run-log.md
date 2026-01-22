# PathToRehab.com - Run Log

## Project Overview
- **Domain**: pathtorehab.com
- **Niche**: SAMHSA Treatment Facilities (Addiction + Mental Health)
- **Opportunity Score**: 6.24 (Target: >4.0)
- **CPC Tier**: 1 ($15-$200/click)
- **Data Source**: SAMHSA N-SUMHSS / FindTreatment.gov API

---

## Phase 0: Setup & Smoke Test
**Date**: 2026-01-22
**Status**: COMPLETE

- [x] MCP Tools verified (Memory, WebSearch, Playwright)
- [x] Existing projects scanned (SalaryScout.dev, carequalitycompare)
- [x] ExistingProjects entity created in Memory MCP
- [x] Phase0_Complete checkpoint saved

---

## Phase 1: Revenue-Optimized Research
**Date**: 2026-01-22
**Status**: COMPLETE

### 1.1 Candidate Generation (100+ WebSearches)
- Generated 30+ niche candidates
- Searched high-CPC verticals: Insurance, Legal, Rehab/Addiction, Finance, Healthcare
- Discovered government data sources: SAMHSA, CMS, College Scorecard, HIFLD

### 1.2 Quick Filter
- Filtered to top candidates with Tier 1-2 CPC
- Validated bulk data availability for each

### 1.3 Opportunity Scoring (10+ candidates)
| Candidate | Traffic | CPC | Scale | Comp | Score |
|-----------|---------|-----|-------|------|-------|
| SAMHSA Treatment | 8 | 3x | 1.3x | 5 | **6.24** |
| College Scorecard | 7 | 2x | 1.5x | 6 | 3.50 |
| Hospital Compare | 7 | 2x | 1.3x | 6 | 3.03 |
| Dialysis Facilities | 6 | 2x | 1.1x | 5 | 2.64 |

**Winner**: SAMHSA Treatment Facilities (Score: 6.24)

### 1.4 Deep Validation
- **Data Source**: FindTreatment.gov API with Developer Guide
- **Size**: 14,000+ substance abuse + mental health facilities
- **Search Volumes**:
  - "drug rehab near me": 78,800/month
  - "alcohol rehab near me": 18,100/month
- **Competitor Benchmark**: AddictionCenter.com (1.4M visitors, $4.1M traffic value)

### 1.5 Domain Research (11 candidates)
| Domain | Status |
|--------|--------|
| treatmentscout.com | TAKEN |
| recoveryscout.com | TAKEN |
| rehabcompass.com | Premium ($3000+) |
| **pathtorehab.com** | **AVAILABLE £8.40/yr** |
| findyourrehab.com | TAKEN |
| recoverypath.com | TAKEN |
| rehablocator.com | TAKEN |
| treatmentpath.com | TAKEN |
| soberjourney.com | TAKEN |
| rehabnavigator.com | TAKEN |
| treatmentdirectory.com | TAKEN |

**Selected**: pathtorehab.com (£8.40/yr)

### 1.6 Project Setup
- [x] Created folder: pathtorehab.com
- [x] Initialized Next.js with TypeScript, Tailwind, App Router
- [x] Created Supabase project: qopzziazpybglvilncel
- [x] Updated ~/.claude.json with postgres MCP config
- [x] Created docs/project-state.json
- [x] Created docs/run-log.md

### Phase 1 Evidence Summary
- WebSearches: 300+ (candidate gen, traffic, CPC, competition, deep validation)
- Candidates generated: 30+
- Quick filtered: 15+
- Fully scored: 10+
- Deep validated: 3
- Domain candidates: 11 checked

---

## Phase 2: Architecture & Specs
**Date**: 2026-01-22
**Status**: COMPLETE

### 2.1 Data Analysis
- Fetched SAMHSA FindTreatment.gov API
- **Total Records**: 98,000 facilities (updated from 14K estimate)
- **API Endpoint**: `https://findtreatment.gov/locator/exportsAsJson/v2`

### 2.2 Entity Fields Identified
| Field | Description |
|-------|-------------|
| name1, name2 | Facility name, alternate name |
| street1, street2, city, state, zip | Address |
| phone, intake1, hotline1 | Contact numbers |
| website | Facility website |
| latitude, longitude | Coordinates |
| typeFacility | SA (Substance), MH (Mental Health), HRSA |
| services[] | Array of service categories |

### 2.3 Service Categories (from API)
- TC: Type of Care
- SET: Service Setting (Outpatient/Residential/Inpatient)
- FT: Facility Type
- PHR: Pharmacotherapies
- TAP: Treatment Approaches
- FOP: Facility Operation (Public/Private)
- PAY: Payment Accepted
- SG: Special Programs/Groups
- AGE: Age Groups Accepted
- AS: Ancillary Services

### 2.4 Database Schema
- `facilities` - Main entity table (98K records)
- `states` - State hub pages (56 records)
- `cities` - City pages (~5K records)

### 2.5 Route Architecture
| Route | Page Type | Est. Count |
|-------|-----------|------------|
| `/facility/[slug]` | Entity (MONEY PAGE) | ~80,000 |
| `/[state]` | State Hub | 56 |
| `/[state]/[city]` | City Page | ~5,000 |
| `/treatment/[type]` | Treatment Type | 10 |
| `/accepts/[payment]` | Payment Filter | 8 |
| `/programs/[program]` | Special Programs | 15 |
| `/browse/*` | Hub Pages | 5 |

**Total Pages**: ~85,000+

### 2.6 Rendering Strategy
- **Decision**: `force-dynamic` for all database-driven pages
- **Reason**: 85K+ pages would timeout with SSG

### 2.7 Output
- [x] Created docs/architecture.md
- [x] Updated docs/project-state.json
- [x] Updated docs/run-log.md

---

## Phase 3: Database & Schema
**Date**: 2026-01-22
**Status**: COMPLETE

### 3.1 Table Creation
- [x] Created `states` table (id, code, name, slug, facility_count)
- [x] Created `cities` table (id, name, slug, state_code, facility_count, lat/lng)
- [x] Created `facilities` table (id, external_id, name, address, contact, services, dqs)

### 3.2 Indexes Created (22 total)
- States: code, slug
- Cities: state_code, slug, composite (state_code, slug)
- Facilities: state, city_slug, slug, facility_type, GIN indexes for arrays

### 3.3 Output
- [x] Script: scripts/init-db.ts
- [x] Tables verified via postgres MCP

---

## Phase 4: Data Ingestion
**Date**: 2026-01-22
**Status**: COMPLETE

### 4.1 Ingestion Script
- [x] Created scripts/ingest-data.ts
- [x] Fetches from FindTreatment.gov API (980 pages)
- [x] Calculates DQS (Data Quality Score) for each facility
- [x] Batch inserts in 1000-record chunks (Supabase limit)

### 4.2 Data Quality Score (DQS) Formula
```
DQS = weighted average of:
- Has phone (0.25)
- Has website (0.20)
- Has coordinates (0.15)
- Has services (0.20)
- Has full address (0.10)
- Has intake phone (0.05)
- Has special programs (0.05)
```

### 4.3 Results
| Metric | Count |
|--------|-------|
| Total facilities | 97,999 |
| States populated | 54 |
| Cities populated | 10,665 |
| Indexable (DQS >= 0.7) | 26,078 |
| Average DQS | 0.72 |

### 4.4 Technical Notes
- Fixed duplicate slug constraint by appending external_id suffix
- Added --truncate flag for clean re-runs
- Uses @supabase/supabase-js (not pg npm which fails on Vercel)

---

## Phase 5: SEO Foundations
**Date**: 2026-01-22
**Status**: COMPLETE

### 5.1 Supabase Client
- [x] Created src/lib/db.ts with @supabase/supabase-js
- [x] Added typed interfaces for Facility, State, City
- [x] Added query functions with batch support for >1000 rows

### 5.2 Custom Sitemap Route
- [x] Created src/app/sitemap/[id]/route.ts (NOT generateSitemaps())
- [x] 5000 URLs per sitemap file
- [x] Batch queries in 1000-row chunks (Supabase limit)
- [x] Includes static pages, state hubs, facility pages

### 5.3 Sitemap Index
- [x] Created src/app/api/sitemap-index/route.ts
- [x] Added rewrite in next.config.ts: /sitemap.xml -> /api/sitemap-index
- [x] Dynamically calculates number of sitemaps needed

### 5.4 Robots & Metadata
- [x] Created src/app/robots.ts
- [x] Updated src/app/layout.tsx with full SEO metadata
- [x] Added max-image-preview:large for Google Discover
- [x] Added GSC verification placeholder

### 5.5 Environment Variables
- [x] Created .env.local with Supabase credentials
- [x] NEXT_PUBLIC_SUPABASE_URL
- [x] SUPABASE_SERVICE_ROLE_KEY
- [x] NEXT_PUBLIC_SITE_URL

### 5.6 Build Verification
- [x] npm run build - PASSES
- [x] Routes verified: /api/sitemap-index (dynamic), /sitemap/[id] (dynamic), /robots.txt (static)

---

## Phase 6: Design System & Assets
**Date**: 2026-01-22
**Status**: COMPLETE

### 6.1 Competitor Analysis
- [x] Took screenshots of AddictionCenter.com
- [x] Analyzed design patterns: purple/blue accents, clean white backgrounds
- [x] Identified opportunities for differentiation

### 6.2 Color Palette (Niche-Appropriate)
| Color | Hex | Psychology |
|-------|-----|------------|
| Primary (Teal) | #0d9488 | Trust, Healing, Calm |
| Secondary (Purple) | #7c3aed | Compassion, Support |
| Accent (Amber) | #f59e0b | Hope, Optimism, Warmth |

### 6.3 Theme System
- [x] Created src/components/ThemeProvider.tsx
- [x] Created src/components/ThemeToggle.tsx
- [x] Supports light/dark/system modes
- [x] Updated src/app/globals.css with CSS variables
- [x] Wrapped layout.tsx with ThemeProvider

### 6.4 magic-ui Component Queries
| Query | Component Type | Implementation |
|-------|----------------|----------------|
| "hero gradient" | Hero section | Inspiration gathered |
| "stat card" | Facility cards | Inspiration gathered |
| "search autocomplete" | Search bar | Implemented |
| "navbar sticky" | Navigation | Inspiration gathered |
| "facility card" | Data cards | Inspiration gathered |

### 6.5 Search Autocomplete
- [x] Created src/components/SearchBar.tsx
- [x] Created src/app/api/search/route.ts
- [x] Features implemented:
  - 200ms debouncing
  - Keyboard navigation (Arrow keys, Enter, Escape)
  - Portal-based dropdown
  - Mobile-responsive positioning
  - Loading states

### 6.6 Asset Generation
- [x] Created src/app/icon.tsx (favicon)
  - Teal gradient background
  - Arrow icon (path to recovery)
- [x] Created src/app/opengraph-image.tsx
  - 1200x630 dimensions
  - Site stats display
  - Teal/purple color scheme

### 6.7 Ad Components
- [x] Created src/components/AdUnit.tsx
- [x] Ad placement types:
  - SidebarAd (300x250, sticky, hidden on mobile)
  - InContentAd (horizontal, responsive)
  - HeroAd (below hero section)

### 6.8 Utility Components
- [x] Created src/lib/utils.ts (cn function)
- [x] Created src/components/Button.tsx
- [x] Installed clsx, tailwind-merge

### 6.9 Build Verification
- [x] npm run build - PASSES
- [x] All new routes compile correctly

---

## Phase 7: Build & Implementation
**Date**: 2026-01-22
**Status**: COMPLETE

### 7.1 Pages Built

| Page | Route | Ad Placements |
|------|-------|---------------|
| Home | `/` | HeroAd, SidebarAd |
| Facility (MONEY PAGE) | `/facility/[slug]` | SidebarAd, InContentAd |
| State Hub | `/[state]` | SidebarAd, InContentAd |
| City Page | `/[state]/[city]` | SidebarAd, InContentAd |
| Browse Hub | `/browse` | SidebarAd |

### 7.2 Home Page (src/app/page.tsx)
- [x] Sticky header with logo and ThemeToggle
- [x] Hero section with gradient background
- [x] SearchBar integration
- [x] Quick stats (facilities, states, SAMHSA verified)
- [x] Feature cards (Why Use Path To Rehab)
- [x] State grid (top 12 states with facility counts)
- [x] Sidebar with SAMHSA helpline
- [x] Full footer with links

### 7.3 Facility Page (src/app/facility/[slug]/page.tsx)
- [x] JSON-LD structured data (MedicalOrganization schema)
- [x] Full breadcrumb navigation
- [x] Contact card (phone, intake, hotline, website)
- [x] Services sections (type of care, settings, payment, age groups, special programs)
- [x] Related facilities in same city
- [x] Proper ad placements

### 7.4 State Page (src/app/[state]/page.tsx)
- [x] State hero with code badge
- [x] SearchBar scoped to state
- [x] Top 12 facilities preview cards
- [x] Cities grid (up to 30 cities)
- [x] JSON-LD ItemList schema

### 7.5 City Page (src/app/[state]/[city]/page.tsx)
- [x] City-specific hero and stats
- [x] Full facility cards with contact info
- [x] Payment options and services display
- [x] JSON-LD ItemList schema

### 7.6 Browse Hub (src/app/browse/page.tsx)
- [x] All states A-Z listing
- [x] Region-based groupings
- [x] Quick jump navigation
- [x] JSON-LD ItemList schema

### 7.7 Database Functions Added
- [x] getStateBySlug() - Fetch single state
- [x] getCityBySlug() - Fetch single city

### 7.8 Build Verification
- [x] npm run build - PASSES
- [x] All routes: /, /[state], /[state]/[city], /facility/[slug], /browse

---

## Phase 8: Data Integration
**Date**: 2026-01-22
**Status**: COMPLETE

### 8.1 Database Client Verification
- [x] Using @supabase/supabase-js (NOT postgres npm)
- [x] Client configured in src/lib/db.ts
- [x] Auth settings: persistSession: false, autoRefreshToken: false

### 8.2 Query Functions
| Function | Purpose | Batch Support |
|----------|---------|---------------|
| getFacilityBySlug | Single facility | N/A |
| getFacilitiesByState | Facilities in state | limit param |
| getFacilitiesByCity | Facilities in city | limit param |
| getAllStates | All states | N/A (< 100) |
| getStateBySlug | Single state | N/A |
| getCitiesByState | Cities in state | N/A |
| getCityBySlug | Single city | N/A |
| getTotalIndexableCount | Count indexable | N/A |
| getAllIndexableSlugs | Sitemap slugs | 1000-row batches |

### 8.3 Environment Variables
- [x] .env.local configured
- [x] NEXT_PUBLIC_SUPABASE_URL set
- [x] SUPABASE_SERVICE_ROLE_KEY set
- [x] NEXT_PUBLIC_SITE_URL set

### 8.4 Deployment Files
- [x] public/ads.txt created with placeholder
- [x] eslint.config.mjs updated to ignore scripts/

### 8.5 Code Quality
- [x] npm run lint - PASSES (0 errors)
- [x] npm run build - PASSES
- [x] All pages have force-dynamic + revalidate = 0

---

## Phase 9: Deployment Prep
**Date**: 2026-01-22
**Status**: COMPLETE

### 9.1 Pre-Deploy Checklist
- [x] npm run build - no errors
- [x] npm run lint - no errors
- [x] NEXT_PUBLIC_SITE_URL = production domain
- [x] ads.txt in public/
- [x] AdSense script in layout.tsx (placeholder)
- [x] Sitemap index API route with rewrite

### 9.2 Deployment
- [x] GitHub repo created: pathtorehab.com
- [x] Code pushed to GitHub
- [x] Vercel linked and deployed
- [x] Environment variables set:
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - DATABASE_URL
  - NEXT_PUBLIC_SITE_URL

### 9.3 Vercel Pro Features Enabled
- [x] Vercel Analytics (real-time traffic data)
- [x] Speed Insights (Core Web Vitals monitoring)
- [x] 2M ISR writes/month
- [x] 300s function timeout available

### 9.4 Supabase Pro Features Active
- [x] Daily automatic backups
- [x] Point-in-time recovery
- [x] 7-day log retention

### 9.5 Live URLs
| URL | Status |
|-----|--------|
| https://pathtorehabcom.vercel.app | LIVE (200) |
| https://pathtorehab.com | Pending domain purchase |

### 9.6 Post-Deploy Verification
- [x] Homepage returns 200
- [x] Sitemap index works (4 sitemaps)
- [x] ads.txt accessible

### 9.7 Next Steps for Domain
1. Purchase pathtorehab.com from Namecheap (£8.40/yr)
2. Add custom domain in Vercel Dashboard
3. Configure DNS (Vercel will provide records)

---

*Log continues as phases complete...*
