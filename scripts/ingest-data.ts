/**
 * Data Ingestion Script for PathToRehab.com
 *
 * Fetches 98K+ facilities from SAMHSA FindTreatment.gov API
 * Calculates DQS (Data Quality Score) for indexability
 * Batch inserts in chunks of 1000 (Supabase limit)
 *
 * Run with: npx tsx scripts/ingest-data.ts
 * Dry run:  npx tsx scripts/ingest-data.ts --dry-run
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'https://findtreatment.gov/locator/exportsAsJson/v2';
const BATCH_SIZE = 1000;
const PAGE_SIZE = 100; // API page size
const DRY_RUN = process.argv.includes('--dry-run');
const TRUNCATE = process.argv.includes('--truncate');

// US State codes and names
const US_STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia', PR: 'Puerto Rico', VI: 'Virgin Islands', GU: 'Guam',
  AS: 'American Samoa', MP: 'Northern Mariana Islands'
};

// Load credentials from Supabase.txt
function loadCredentials(): { url: string; serviceKey: string } {
  const credPath = path.join(__dirname, '..', 'Supabase.txt');
  const content = fs.readFileSync(credPath, 'utf-8');

  const url = content.match(/SUPABASE_URL=(.+)/)?.[1]?.trim();
  const serviceKey = content.match(/SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();

  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in Supabase.txt');
  }

  return { url, serviceKey };
}

// Create slug from text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
}

// Create unique facility slug - append external_id for uniqueness
function createFacilitySlug(name: string, city: string, state: string, externalId: string | number): string {
  const base = slugify(`${name} ${city} ${state}`);
  // Always append external_id to ensure uniqueness
  const suffix = String(externalId).slice(-6);
  return base ? `${base}-${suffix}` : `facility-${state.toLowerCase()}-${suffix}`;
}

// Extract service values from services array
interface ServiceItem {
  f1?: string; // Category name
  f2?: string; // Code (TC, SET, PAY, etc.)
  f3?: string; // Values (comma-separated)
}

function extractServiceValues(services: ServiceItem[] | undefined, code: string): string[] {
  if (!services || !Array.isArray(services)) return [];

  const service = services.find(s => s.f2 === code);
  if (!service?.f3) return [];

  return service.f3
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

// Calculate Data Quality Score (DQS)
interface FacilityRaw {
  _irow?: number;
  name1?: string;
  name2?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  intake1?: string;
  hotline1?: string;
  website?: string;
  latitude?: string | number;
  longitude?: string | number;
  typeFacility?: string;
  services?: ServiceItem[];
}

function calculateDQS(facility: FacilityRaw): number {
  let score = 0;

  // Fields filled (40%)
  const fields = [
    facility.name1,
    facility.street1,
    facility.city,
    facility.state,
    facility.zip,
    facility.phone,
    facility.website,
    facility.latitude,
    facility.longitude,
    facility.services
  ];
  const filled = fields.filter(f => f !== null && f !== undefined && f !== '').length;
  score += (filled / fields.length) * 0.4;

  // Has unique content - services array with details (30%)
  const servicesCount = facility.services?.length || 0;
  if (servicesCount > 3) score += 0.3;
  else if (servicesCount > 0) score += 0.15;

  // Has location data (20%)
  const lat = parseFloat(String(facility.latitude || ''));
  const lon = parseFloat(String(facility.longitude || ''));
  if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
    score += 0.2;
  }

  // Has contact data (10%)
  if (facility.phone || facility.website || facility.intake1) {
    score += 0.1;
  }

  return Math.round(score * 100) / 100;
}

// Transform API row to database record
interface FacilityRecord {
  external_id: string;
  name: string;
  name_alt: string | null;
  slug: string;
  street1: string | null;
  street2: string | null;
  city: string;
  city_slug: string;
  state: string;
  state_name: string;
  zip: string | null;
  phone: string | null;
  intake_phone: string | null;
  hotline: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  facility_type: string | null;
  services: ServiceItem[] | null;
  type_of_care: string[];
  service_settings: string[];
  payment_options: string[];
  age_groups: string[];
  special_programs: string[];
  dqs: number;
  is_indexable: boolean;
}

function transformFacility(raw: FacilityRaw, index: number): FacilityRecord | null {
  // Skip if missing required fields
  if (!raw.name1 || !raw.city || !raw.state) {
    return null;
  }

  const stateName = US_STATES[raw.state] || raw.state;
  const citySlug = slugify(raw.city);
  const externalId = raw._irow || index;
  const facilitySlug = createFacilitySlug(raw.name1, raw.city, raw.state, externalId);

  const dqs = calculateDQS(raw);
  const isIndexable = dqs >= 0.7;

  // Parse coordinates
  const lat = parseFloat(String(raw.latitude || ''));
  const lon = parseFloat(String(raw.longitude || ''));

  return {
    external_id: String(raw._irow || index),
    name: raw.name1,
    name_alt: raw.name2 || null,
    slug: facilitySlug,
    street1: raw.street1 || null,
    street2: raw.street2 || null,
    city: raw.city,
    city_slug: citySlug,
    state: raw.state,
    state_name: stateName,
    zip: raw.zip || null,
    phone: raw.phone || null,
    intake_phone: raw.intake1 || null,
    hotline: raw.hotline1 || null,
    website: raw.website || null,
    latitude: isNaN(lat) ? null : lat,
    longitude: isNaN(lon) ? null : lon,
    facility_type: raw.typeFacility || null,
    services: raw.services || null,
    type_of_care: extractServiceValues(raw.services, 'TC'),
    service_settings: extractServiceValues(raw.services, 'SET'),
    payment_options: extractServiceValues(raw.services, 'PAY'),
    age_groups: extractServiceValues(raw.services, 'AGE'),
    special_programs: extractServiceValues(raw.services, 'SG'),
    dqs,
    is_indexable: isIndexable,
  };
}

// Fetch all facilities from API with pagination
async function fetchAllFacilities(): Promise<FacilityRaw[]> {
  console.log('📥 Fetching facilities from FindTreatment.gov API...\n');

  const allFacilities: FacilityRaw[] = [];
  let page = 1;
  let totalPages = 1;

  // Use a central US location to get nationwide results
  // With very large radius (50000 km = essentially all US)
  const baseUrl = `${API_BASE}?sAddr=Kansas%20City%20KS&limitType=2&limitValue=5000000&pageSize=${PAGE_SIZE}`;

  while (page <= totalPages) {
    const url = `${baseUrl}&page=${page}`;
    process.stdout.write(`  Page ${page}/${totalPages || '?'}...`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      totalPages = data.totalPages || 1;

      if (data.rows && Array.isArray(data.rows)) {
        allFacilities.push(...data.rows);
        process.stdout.write(` ${data.rows.length} facilities\n`);
      } else {
        process.stdout.write(' no rows\n');
      }

      page++;

      // Rate limiting - be nice to the API
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`\n  Error on page ${page}:`, error);
      page++;
    }
  }

  console.log(`\n✅ Fetched ${allFacilities.length} total facilities\n`);
  return allFacilities;
}

// Batch insert facilities
async function insertFacilities(supabase: SupabaseClient, facilities: FacilityRecord[]): Promise<number> {
  console.log(`📤 Inserting ${facilities.length} facilities in batches of ${BATCH_SIZE}...\n`);

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < facilities.length; i += BATCH_SIZE) {
    const batch = facilities.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(facilities.length / BATCH_SIZE);

    process.stdout.write(`  Batch ${batchNum}/${totalBatches} (${batch.length} records)...`);

    if (DRY_RUN) {
      process.stdout.write(' [DRY RUN]\n');
      inserted += batch.length;
      continue;
    }

    // Use upsert to handle duplicates
    const { data, error } = await supabase
      .from('facilities')
      .upsert(batch, {
        onConflict: 'external_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(` ERROR: ${error.message}`);
      errors++;

      // Try inserting one by one to find problematic records
      for (const record of batch) {
        const { error: singleError } = await supabase
          .from('facilities')
          .upsert(record, { onConflict: 'external_id' });

        if (!singleError) {
          inserted++;
        }
      }
    } else {
      inserted += batch.length;
      process.stdout.write(' OK\n');
    }
  }

  console.log(`\n✅ Inserted ${inserted} facilities (${errors} batch errors)\n`);
  return inserted;
}

// Populate states table from facilities
async function populateStates(supabase: SupabaseClient): Promise<void> {
  console.log('🗺️  Populating states table...\n');

  if (DRY_RUN) {
    console.log('  [DRY RUN] Would populate states table\n');
    return;
  }

  // Get unique states and counts from facilities
  const { data: stateCounts, error } = await supabase
    .from('facilities')
    .select('state, state_name')
    .not('state', 'is', null);

  if (error) {
    console.error('Error fetching states:', error);
    return;
  }

  // Count facilities per state
  const stateMap = new Map<string, { name: string; count: number }>();
  for (const row of stateCounts || []) {
    const existing = stateMap.get(row.state) || { name: row.state_name, count: 0 };
    existing.count++;
    stateMap.set(row.state, existing);
  }

  // Prepare state records
  const states = Array.from(stateMap.entries()).map(([code, data]) => ({
    code,
    name: data.name,
    slug: slugify(data.name),
    facility_count: data.count
  }));

  // Batch insert states
  for (let i = 0; i < states.length; i += BATCH_SIZE) {
    const batch = states.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase
      .from('states')
      .upsert(batch, { onConflict: 'code' });

    if (insertError) {
      console.error('Error inserting states:', insertError);
    }
  }

  console.log(`✅ Populated ${states.length} states\n`);
}

// Populate cities table from facilities
async function populateCities(supabase: SupabaseClient): Promise<void> {
  console.log('🏙️  Populating cities table...\n');

  if (DRY_RUN) {
    console.log('  [DRY RUN] Would populate cities table\n');
    return;
  }

  // Get all unique city/state combinations with counts
  // Need to batch this due to 1000 row limit
  let allFacilities: any[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('facilities')
      .select('city, city_slug, state, latitude, longitude')
      .range(offset, offset + 999);

    if (error || !data || data.length === 0) break;
    allFacilities = allFacilities.concat(data);
    offset += 1000;
    if (data.length < 1000) break;
  }

  // Count facilities per city
  const cityMap = new Map<string, {
    name: string;
    slug: string;
    state: string;
    count: number;
    lat: number | null;
    lon: number | null;
  }>();

  for (const row of allFacilities) {
    const key = `${row.city_slug}-${row.state}`;
    const existing = cityMap.get(key);

    if (existing) {
      existing.count++;
      // Use first valid coordinates
      if (!existing.lat && row.latitude) {
        existing.lat = row.latitude;
        existing.lon = row.longitude;
      }
    } else {
      cityMap.set(key, {
        name: row.city,
        slug: row.city_slug,
        state: row.state,
        count: 1,
        lat: row.latitude,
        lon: row.longitude
      });
    }
  }

  // Prepare city records
  const cities = Array.from(cityMap.values()).map(data => ({
    name: data.name,
    slug: data.slug,
    state_code: data.state,
    facility_count: data.count,
    latitude: data.lat,
    longitude: data.lon
  }));

  console.log(`  Processing ${cities.length} cities...\n`);

  // Batch insert cities
  let inserted = 0;
  for (let i = 0; i < cities.length; i += BATCH_SIZE) {
    const batch = cities.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase
      .from('cities')
      .upsert(batch, { onConflict: 'slug,state_code' });

    if (insertError) {
      console.error(`  Error on batch ${i / BATCH_SIZE + 1}:`, insertError.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`✅ Populated ${inserted} cities\n`);
}

// Update data_metadata table
async function updateMetadata(supabase: SupabaseClient, recordCount: number): Promise<void> {
  console.log('📝 Updating data_metadata...\n');

  if (DRY_RUN) {
    console.log('  [DRY RUN] Would update data_metadata\n');
    return;
  }

  // Get current month and year for data_period
  const now = new Date();
  const dataPeriod = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const { error } = await supabase
    .from('data_metadata')
    .upsert({
      id: 1,
      source_name: 'SAMHSA FindTreatment',
      source_url: 'https://findtreatment.gov/locator/exportsAsJson/v2',
      data_period: dataPeriod,
      record_count: recordCount,
      last_updated: now.toISOString(),
      last_checked_at: now.toISOString(),
    }, { onConflict: 'id' });

  if (error) {
    console.error('  Error updating metadata:', error.message);
    console.log('  (This is OK if the table does not exist yet)\n');
  } else {
    console.log(`  ✅ Updated metadata: ${recordCount} records, period: ${dataPeriod}\n`);
  }
}

// Main execution
async function main(): Promise<void> {
  console.log('🚀 PathToRehab Data Ingestion\n');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}${TRUNCATE ? ' (with TRUNCATE)' : ''}\n`);
  console.log('─'.repeat(50) + '\n');

  // Initialize Supabase client
  const { url, serviceKey } = loadCredentials();
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // Truncate tables if requested
  if (TRUNCATE && !DRY_RUN) {
    console.log('🗑️  Truncating existing data...\n');
    await supabase.from('facilities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cities').delete().gt('id', 0);
    await supabase.from('states').delete().gt('id', 0);
    console.log('✅ Tables cleared\n');
  }

  // Step 1: Fetch all facilities from API
  const rawFacilities = await fetchAllFacilities();

  // Step 2: Transform facilities
  console.log('🔄 Transforming facility data...\n');
  const allFacilities: FacilityRecord[] = [];
  let skipped = 0;

  for (let i = 0; i < rawFacilities.length; i++) {
    const transformed = transformFacility(rawFacilities[i], i);
    if (transformed) {
      allFacilities.push(transformed);
    } else {
      skipped++;
    }
  }

  console.log(`  Transformed: ${allFacilities.length}`);
  console.log(`  Skipped (missing required fields): ${skipped}\n`);

  // Step 2b: Deduplicate facilities (same name + address + city + state + phone)
  console.log('🔄 Deduplicating facilities...\n');
  const seen = new Map<string, FacilityRecord>();

  // Sort by DQS descending so we keep the highest quality record
  allFacilities.sort((a, b) => b.dqs - a.dqs);

  for (const facility of allFacilities) {
    const key = `${facility.name}|${facility.street1 || ''}|${facility.city}|${facility.state}|${facility.phone || ''}`;
    if (!seen.has(key)) {
      seen.set(key, facility);
    }
  }

  const facilities = Array.from(seen.values());
  const duplicatesRemoved = allFacilities.length - facilities.length;

  console.log(`  Unique facilities: ${facilities.length}`);
  console.log(`  Duplicates removed: ${duplicatesRemoved}\n`);

  // Calculate DQS stats
  const indexable = facilities.filter(f => f.is_indexable).length;
  const avgDQS = facilities.reduce((sum, f) => sum + f.dqs, 0) / facilities.length;

  console.log('📊 DQS Statistics:');
  console.log(`  Average DQS: ${avgDQS.toFixed(2)}`);
  console.log(`  Indexable (DQS >= 0.7): ${indexable} (${(indexable / facilities.length * 100).toFixed(1)}%)`);
  console.log(`  Non-indexable: ${facilities.length - indexable}\n`);

  console.log('─'.repeat(50) + '\n');

  // Step 3: Insert facilities
  await insertFacilities(supabase, facilities);

  // Step 4: Populate states
  await populateStates(supabase);

  // Step 5: Populate cities
  await populateCities(supabase);

  console.log('─'.repeat(50) + '\n');
  console.log('✅ Data ingestion complete!\n');

  // Verification
  if (!DRY_RUN) {
    console.log('📋 Verifying counts...\n');

    const { count: facilityCount } = await supabase
      .from('facilities')
      .select('*', { count: 'exact', head: true });

    const { count: stateCount } = await supabase
      .from('states')
      .select('*', { count: 'exact', head: true });

    const { count: cityCount } = await supabase
      .from('cities')
      .select('*', { count: 'exact', head: true });

    const { count: indexableCount } = await supabase
      .from('facilities')
      .select('*', { count: 'exact', head: true })
      .eq('is_indexable', true);

    console.log(`  Facilities: ${facilityCount}`);
    console.log(`  States: ${stateCount}`);
    console.log(`  Cities: ${cityCount}`);
    console.log(`  Indexable facilities: ${indexableCount}\n`);

    // Update metadata table for data freshness tracking
    await updateMetadata(supabase, facilityCount || 0);
  }
}

main().catch(console.error);
