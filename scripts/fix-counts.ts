/**
 * Fix facility counts in states and cities tables
 *
 * Updates counts to only include indexable facilities (DQS >= 0.7)
 *
 * Run with: npx tsx scripts/fix-counts.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const BATCH_SIZE = 100;

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

async function main(): Promise<void> {
  console.log('🔧 Fixing facility counts...\n');

  const { url, serviceKey } = loadCredentials();
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // Step 1: Fix state counts
  console.log('📊 Updating state facility counts...\n');

  // Get all states
  const { data: states, error: statesError } = await supabase
    .from('states')
    .select('id, code, name');

  if (statesError) {
    console.error('Error fetching states:', statesError);
    return;
  }

  for (const state of states || []) {
    // Count indexable facilities for this state
    const { count, error: countError } = await supabase
      .from('facilities')
      .select('*', { count: 'exact', head: true })
      .eq('state', state.code)
      .eq('is_indexable', true);

    if (countError) {
      console.error(`  Error counting ${state.code}:`, countError.message);
      continue;
    }

    // Update state with correct count
    const { error: updateError } = await supabase
      .from('states')
      .update({ facility_count: count || 0 })
      .eq('id', state.id);

    if (updateError) {
      console.error(`  Error updating ${state.code}:`, updateError.message);
    } else {
      console.log(`  ${state.name}: ${count} indexable facilities`);
    }
  }

  console.log('\n✅ State counts updated\n');

  // Step 2: Fix city counts
  console.log('🏙️  Updating city facility counts...\n');

  // Get all cities in batches
  let offset = 0;
  let totalCities = 0;
  let updatedCities = 0;

  while (true) {
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, slug, state_code, name')
      .range(offset, offset + BATCH_SIZE - 1);

    if (citiesError) {
      console.error('Error fetching cities:', citiesError);
      break;
    }

    if (!cities || cities.length === 0) break;

    totalCities += cities.length;

    for (const city of cities) {
      // Count indexable facilities for this city
      const { count, error: countError } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true })
        .eq('state', city.state_code)
        .eq('city_slug', city.slug)
        .eq('is_indexable', true);

      if (countError) {
        console.error(`  Error counting ${city.name}, ${city.state_code}:`, countError.message);
        continue;
      }

      // Update city with correct count
      const { error: updateError } = await supabase
        .from('cities')
        .update({ facility_count: count || 0 })
        .eq('id', city.id);

      if (!updateError) {
        updatedCities++;
      }
    }

    process.stdout.write(`  Processed ${totalCities} cities...\r`);

    offset += BATCH_SIZE;
    if (cities.length < BATCH_SIZE) break;
  }

  console.log(`\n✅ Updated ${updatedCities} city counts\n`);

  // Step 3: Verify
  console.log('📋 Verification:\n');

  const { count: totalIndexable } = await supabase
    .from('facilities')
    .select('*', { count: 'exact', head: true })
    .eq('is_indexable', true);

  const { data: stateSum } = await supabase
    .from('states')
    .select('facility_count');

  const stateTotalCount = (stateSum || []).reduce((sum, s) => sum + (s.facility_count || 0), 0);

  console.log(`  Total indexable facilities: ${totalIndexable}`);
  console.log(`  Sum of state counts: ${stateTotalCount}`);
  console.log(`  Match: ${totalIndexable === stateTotalCount ? '✅ YES' : '❌ NO'}\n`);

  // Show top 5 states
  const { data: topStates } = await supabase
    .from('states')
    .select('name, facility_count')
    .order('facility_count', { ascending: false })
    .limit(5);

  console.log('  Top 5 states by indexable facilities:');
  for (const s of topStates || []) {
    console.log(`    ${s.name}: ${s.facility_count}`);
  }

  console.log('\n✅ Count fix complete!\n');
}

main().catch(console.error);
