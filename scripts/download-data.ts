/**
 * Download latest SAMHSA treatment facility data
 *
 * Data source: SAMHSA FindTreatment.gov API
 * API: https://findtreatment.gov/locator/exportsAsJson/v2
 * License: Public Domain (US Government)
 *
 * Run: npx tsx scripts/download-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const SAMHSA_API_URL = 'https://findtreatment.gov/locator/exportsAsJson/v2';
const DATA_DIR = path.join(process.cwd(), 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'samhsa-facilities.json');
const METADATA_FILE = path.join(DATA_DIR, 'metadata.json');

interface SAMHSAFacility {
  frid: string;
  name1: string;
  name2?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  intake1?: string;
  hotline?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  typeFacility?: string;
  services?: string[];
  [key: string]: unknown;
}

async function downloadData(): Promise<void> {
  console.log('Starting SAMHSA data download...');
  console.log(`API URL: ${SAMHSA_API_URL}`);
  console.log(`Output: ${OUTPUT_FILE}`);

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Created data directory: ${DATA_DIR}`);
  }

  try {
    console.log('\nFetching data from SAMHSA API...');
    const startTime = Date.now();

    const response = await fetch(SAMHSA_API_URL, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PathToRehab/1.0 (Data Sync)',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as SAMHSAFacility[];
    const fetchTime = Date.now() - startTime;

    console.log(`Fetched ${data.length} facilities in ${(fetchTime / 1000).toFixed(2)}s`);

    // Write facility data
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`Saved facility data to ${OUTPUT_FILE}`);

    // Calculate stats
    const states = new Set(data.map((f: SAMHSAFacility) => f.state));
    const cities = new Set(data.map((f: SAMHSAFacility) => `${f.state}-${f.city}`));
    const withPhone = data.filter((f: SAMHSAFacility) => f.phone || f.intake1).length;
    const withWebsite = data.filter((f: SAMHSAFacility) => f.website).length;
    const withCoords = data.filter((f: SAMHSAFacility) => f.latitude && f.longitude).length;

    // Write metadata
    const metadata = {
      downloadedAt: new Date().toISOString(),
      recordCount: data.length,
      stateCount: states.size,
      cityCount: cities.size,
      withPhone,
      withWebsite,
      withCoordinates: withCoords,
      sourceUrl: SAMHSA_API_URL,
      fetchTimeMs: fetchTime,
    };

    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
    console.log(`Saved metadata to ${METADATA_FILE}`);

    // Summary
    console.log('\n--- Download Summary ---');
    console.log(`Total facilities: ${data.length.toLocaleString()}`);
    console.log(`States/territories: ${states.size}`);
    console.log(`Unique cities: ${cities.size.toLocaleString()}`);
    console.log(`With phone: ${withPhone.toLocaleString()} (${((withPhone / data.length) * 100).toFixed(1)}%)`);
    console.log(`With website: ${withWebsite.toLocaleString()} (${((withWebsite / data.length) * 100).toFixed(1)}%)`);
    console.log(`With coordinates: ${withCoords.toLocaleString()} (${((withCoords / data.length) * 100).toFixed(1)}%)`);
    console.log('------------------------\n');

    console.log('Download complete!');
  } catch (error) {
    console.error('Download failed:', error);
    process.exit(1);
  }
}

// Run if called directly
downloadData();
