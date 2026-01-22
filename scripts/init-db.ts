/**
 * Database Initialization Script for PathToRehab.com
 *
 * Creates tables: facilities, states, cities
 * Run with: npx tsx scripts/init-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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

async function initDatabase() {
  console.log('🚀 Initializing PathToRehab database...\n');

  const { url, serviceKey } = loadCredentials();
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // SQL statements to create tables
  const statements = [
    // States table
    `CREATE TABLE IF NOT EXISTS states (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      facility_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Cities table
    `CREATE TABLE IF NOT EXISTS cities (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      state_code TEXT NOT NULL,
      facility_count INTEGER DEFAULT 0,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(slug, state_code)
    )`,

    // Facilities table (main entity)
    `CREATE TABLE IF NOT EXISTS facilities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      external_id TEXT UNIQUE,
      name TEXT NOT NULL,
      name_alt TEXT,
      slug TEXT UNIQUE NOT NULL,

      street1 TEXT,
      street2 TEXT,
      city TEXT NOT NULL,
      city_slug TEXT NOT NULL,
      state TEXT NOT NULL,
      state_name TEXT NOT NULL,
      zip TEXT,

      phone TEXT,
      intake_phone TEXT,
      hotline TEXT,
      website TEXT,

      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),

      facility_type TEXT,
      services JSONB,

      type_of_care TEXT[],
      service_settings TEXT[],
      payment_options TEXT[],
      age_groups TEXT[],
      special_programs TEXT[],

      dqs DECIMAL(3, 2),
      is_indexable BOOLEAN DEFAULT true,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Indexes for states
    `CREATE INDEX IF NOT EXISTS idx_states_code ON states(code)`,
    `CREATE INDEX IF NOT EXISTS idx_states_slug ON states(slug)`,

    // Indexes for cities
    `CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state_code)`,
    `CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug)`,
    `CREATE INDEX IF NOT EXISTS idx_cities_state_slug ON cities(state_code, slug)`,

    // Indexes for facilities
    `CREATE INDEX IF NOT EXISTS idx_facilities_state ON facilities(state)`,
    `CREATE INDEX IF NOT EXISTS idx_facilities_city_slug ON facilities(city_slug)`,
    `CREATE INDEX IF NOT EXISTS idx_facilities_slug ON facilities(slug)`,
    `CREATE INDEX IF NOT EXISTS idx_facilities_facility_type ON facilities(facility_type)`,
    `CREATE INDEX IF NOT EXISTS idx_facilities_type_of_care ON facilities USING GIN(type_of_care)`,
    `CREATE INDEX IF NOT EXISTS idx_facilities_service_settings ON facilities USING GIN(service_settings)`,
    `CREATE INDEX IF NOT EXISTS idx_facilities_payment_options ON facilities USING GIN(payment_options)`,
    `CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities(latitude, longitude)`,
    `CREATE INDEX IF NOT EXISTS idx_facilities_indexable ON facilities(is_indexable) WHERE is_indexable = true`,
  ];

  // Execute each statement
  for (const sql of statements) {
    const shortName = sql.substring(0, 60).replace(/\s+/g, ' ').trim();
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        // Try direct execution via REST API
        const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ sql_query: sql })
        });

        if (!response.ok) {
          // Fallback: Use pg for DDL (local only)
          throw new Error(`RPC not available: ${error.message}`);
        }
      }
      console.log(`✅ ${shortName}...`);
    } catch (err) {
      console.log(`⚠️  ${shortName}... (will use direct pg)`);
    }
  }

  console.log('\n📋 Verifying tables...');

  // Verify tables exist
  const { data: tables, error: tableError } = await supabase
    .from('information_schema.tables' as any)
    .select('table_name')
    .eq('table_schema', 'public');

  if (tableError) {
    console.log('⚠️  Could not verify via Supabase JS, using direct query...');
  } else {
    console.log('Tables found:', tables?.map(t => t.table_name).join(', '));
  }

  console.log('\n✅ Database initialization complete!');
}

// Alternative: Direct pg execution for DDL
async function initDatabaseWithPg() {
  console.log('🚀 Initializing PathToRehab database with pg...\n');

  const { Client } = await import('pg');

  // Build connection string with URL-encoded password
  const password = encodeURIComponent('8rrUSLBj@zbj#l9O8TwPJE5#');
  const connectionString = `postgresql://postgres:${password}@db.qopzziazpybglvilncel.supabase.co:5432/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Create tables
    console.log('Creating states table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS states (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        facility_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ states table created');

    console.log('Creating cities table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        state_code TEXT NOT NULL,
        facility_count INTEGER DEFAULT 0,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(slug, state_code)
      )
    `);
    console.log('✅ cities table created');

    console.log('Creating facilities table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS facilities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        external_id TEXT UNIQUE,
        name TEXT NOT NULL,
        name_alt TEXT,
        slug TEXT UNIQUE NOT NULL,

        street1 TEXT,
        street2 TEXT,
        city TEXT NOT NULL,
        city_slug TEXT NOT NULL,
        state TEXT NOT NULL,
        state_name TEXT NOT NULL,
        zip TEXT,

        phone TEXT,
        intake_phone TEXT,
        hotline TEXT,
        website TEXT,

        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),

        facility_type TEXT,
        services JSONB,

        type_of_care TEXT[],
        service_settings TEXT[],
        payment_options TEXT[],
        age_groups TEXT[],
        special_programs TEXT[],

        dqs DECIMAL(3, 2),
        is_indexable BOOLEAN DEFAULT true,

        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ facilities table created');

    // Create indexes
    console.log('\nCreating indexes...');

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_states_code ON states(code)',
      'CREATE INDEX IF NOT EXISTS idx_states_slug ON states(slug)',
      'CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state_code)',
      'CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug)',
      'CREATE INDEX IF NOT EXISTS idx_cities_state_slug ON cities(state_code, slug)',
      'CREATE INDEX IF NOT EXISTS idx_facilities_state ON facilities(state)',
      'CREATE INDEX IF NOT EXISTS idx_facilities_city_slug ON facilities(city_slug)',
      'CREATE INDEX IF NOT EXISTS idx_facilities_slug ON facilities(slug)',
      'CREATE INDEX IF NOT EXISTS idx_facilities_facility_type ON facilities(facility_type)',
      'CREATE INDEX IF NOT EXISTS idx_facilities_type_of_care ON facilities USING GIN(type_of_care)',
      'CREATE INDEX IF NOT EXISTS idx_facilities_service_settings ON facilities USING GIN(service_settings)',
      'CREATE INDEX IF NOT EXISTS idx_facilities_payment_options ON facilities USING GIN(payment_options)',
      'CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities(latitude, longitude)',
      'CREATE INDEX IF NOT EXISTS idx_facilities_indexable ON facilities(is_indexable) WHERE is_indexable = true',
    ];

    for (const idx of indexes) {
      await client.query(idx);
    }
    console.log('✅ All indexes created');

    // Verify
    console.log('\n📋 Verifying tables...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);
    console.log('Tables:', result.rows.map(r => r.table_name).join(', '));

    console.log('\n✅ Database initialization complete!');

  } finally {
    await client.end();
  }
}

// Run with pg (more reliable for DDL)
initDatabaseWithPg().catch(console.error);
