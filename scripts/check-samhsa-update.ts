/**
 * SAMHSA Data Update Checker
 *
 * Checks the SAMHSA FindTreatment API for data changes.
 * Compares record count with current database metadata to determine if update is needed.
 *
 * Usage:
 *   npx tsx scripts/check-samhsa-update.ts
 *
 * Exit codes:
 *   0 - No update needed
 *   1 - New data available (record count changed)
 *   2 - Error occurred
 */

import { createClient } from '@supabase/supabase-js';

// SAMHSA API URL
const SAMHSA_API_URL = 'https://findtreatment.gov/locator/exportsAsJson/v2';

interface SAMHSAResponse {
  page: number;
  totalPages: number;
  recordCount: number;
  rows: unknown[];
}

interface DataMetadata {
  record_count: number;
  last_updated: string;
  data_period: string;
}

interface CheckResult {
  hasUpdate: boolean;
  currentCount: number;
  latestCount: number | null;
  error: string | null;
}

/**
 * Fetch the first page of SAMHSA API to get record count
 */
async function fetchSAMHSARecordCount(): Promise<{ recordCount: number; totalPages: number } | null> {
  try {
    const response = await fetch(`${SAMHSA_API_URL}?page=1`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'PathToRehab Data Checker (+https://pathtorehab.com)',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch SAMHSA API: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as SAMHSAResponse;

    return {
      recordCount: data.recordCount,
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error('Error fetching SAMHSA API:', error);
    return null;
  }
}

/**
 * Get current data metadata from database
 */
async function getCurrentMetadata(): Promise<DataMetadata | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from('data_metadata')
      .select('record_count, last_updated, data_period')
      .eq('id', 1)
      .single();

    if (error) {
      // Table might not exist yet - return default
      if (error.code === 'PGRST116' || error.code === '42P01') {
        console.log('data_metadata table does not exist yet or is empty');
        return {
          record_count: 0,
          last_updated: new Date().toISOString(),
          data_period: 'Unknown',
        };
      }
      console.error('Database error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
}

/**
 * Update the last_checked_at timestamp in metadata
 */
async function updateLastChecked(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) return;

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    await supabase
      .from('data_metadata')
      .update({ last_checked_at: new Date().toISOString() })
      .eq('id', 1);
  } catch {
    // Ignore errors
  }
}

/**
 * Main check function
 */
async function checkForUpdate(): Promise<CheckResult> {
  // Get current metadata
  const metadata = await getCurrentMetadata();

  if (!metadata) {
    return {
      hasUpdate: false,
      currentCount: 0,
      latestCount: null,
      error: 'Failed to get current metadata',
    };
  }

  // Fetch latest count from SAMHSA
  const latest = await fetchSAMHSARecordCount();

  // Update last checked timestamp
  await updateLastChecked();

  if (!latest) {
    return {
      hasUpdate: false,
      currentCount: metadata.record_count,
      latestCount: null,
      error: 'Failed to fetch SAMHSA API',
    };
  }

  // Compare record counts - allow small variance (up to 1% difference triggers update)
  // This handles small daily changes vs major data releases
  const percentDiff = Math.abs(latest.recordCount - metadata.record_count) / metadata.record_count;
  const hasSignificantChange = percentDiff > 0.01 || metadata.record_count === 0;

  return {
    hasUpdate: hasSignificantChange,
    currentCount: metadata.record_count,
    latestCount: latest.recordCount,
    error: null,
  };
}

// Run the check
async function main() {
  console.log('🔍 Checking SAMHSA FindTreatment API for data updates...\n');

  const result = await checkForUpdate();

  if (result.error) {
    console.error(`❌ Error: ${result.error}`);
    process.exit(2);
  }

  console.log(`📊 Current record count: ${result.currentCount.toLocaleString()}`);
  console.log(`🌐 Latest API count:     ${result.latestCount?.toLocaleString() ?? 'Unknown'}`);

  if (result.latestCount) {
    const diff = result.latestCount - result.currentCount;
    const percentDiff = ((diff / result.currentCount) * 100).toFixed(2);
    console.log(`📈 Difference:           ${diff >= 0 ? '+' : ''}${diff.toLocaleString()} (${percentDiff}%)`);
  }

  if (result.hasUpdate) {
    console.log(`\n✅ DATA CHANGE DETECTED!`);
    console.log(`\nRun the download and ingest scripts to update:`);
    console.log(`  npx tsx scripts/download-data.ts`);
    console.log(`  npx tsx scripts/ingest-data.ts`);

    // Output for GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
      const fs = await import('fs');
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_update=true\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `latest_count=${result.latestCount}\n`);
    }

    process.exit(1); // Exit 1 = update available
  } else {
    console.log(`\n✓ Data is up to date. No significant changes detected.`);

    // Output for GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
      const fs = await import('fs');
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_update=false\n`);
    }

    process.exit(0); // Exit 0 = no update
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(2);
});
