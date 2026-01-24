/**
 * Create data_metadata table for tracking data freshness
 *
 * Run: npx tsx scripts/create-metadata-table.ts
 */

import { createClient } from '@supabase/supabase-js';

async function createMetadataTable() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Creating data_metadata table...');

  // Check if table exists by trying to query it
  const { error: checkError } = await supabase
    .from('data_metadata')
    .select('id')
    .limit(1);

  if (!checkError) {
    console.log('Table data_metadata already exists');

    // Insert default row if empty
    const { data: existingData } = await supabase
      .from('data_metadata')
      .select('id')
      .eq('id', 1)
      .single();

    if (!existingData) {
      const { error: insertError } = await supabase.from('data_metadata').insert({
        id: 1,
        source_name: 'SAMHSA FindTreatment',
        source_url: 'https://findtreatment.gov/locator/exportsAsJson/v2',
        data_period: 'January 2025',
        record_count: 0,
        last_updated: new Date().toISOString(),
        last_checked_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Error inserting default row:', insertError);
      } else {
        console.log('Inserted default metadata row');
      }
    }

    return;
  }

  // Table doesn't exist - need to create via SQL
  // Note: Supabase JS can't run DDL, so we'll use RPC or output the SQL
  console.log('\nPlease run this SQL in Supabase SQL Editor:\n');
  console.log(`
-- Create data_metadata table
CREATE TABLE IF NOT EXISTS data_metadata (
  id INTEGER PRIMARY KEY DEFAULT 1,
  source_name TEXT NOT NULL,
  source_url TEXT,
  data_period TEXT NOT NULL,
  record_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial row
INSERT INTO data_metadata (id, source_name, source_url, data_period, record_count)
VALUES (
  1,
  'SAMHSA FindTreatment',
  'https://findtreatment.gov/locator/exportsAsJson/v2',
  'January 2025',
  0
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (optional but recommended)
ALTER TABLE data_metadata ENABLE ROW LEVEL SECURITY;

-- Create policy for service role
CREATE POLICY "Service role can manage metadata" ON data_metadata
  FOR ALL
  USING (true)
  WITH CHECK (true);
  `);
}

createMetadataTable().catch(console.error);
