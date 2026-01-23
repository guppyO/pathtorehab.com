import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Facility {
  id: string;
  name: string;
  street1: string | null;
  city: string;
  state: string;
  phone: string | null;
  dqs: number;
}

async function dedupeFacilities() {
  console.log('🔧 Deduplicating facilities...\n');

  // Get all indexable facilities with pagination (Supabase limit is 1000)
  const facilities: Facility[] = [];
  const pageSize = 1000;
  let offset = 0;
  let hasMore = true;

  console.log('📥 Fetching all facilities...');

  while (hasMore) {
    const { data, error } = await supabase
      .from('facilities')
      .select('id, name, street1, city, state, phone, dqs')
      .eq('is_indexable', true)
      .order('dqs', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching facilities:', error);
      return;
    }

    if (data && data.length > 0) {
      facilities.push(...data);
      offset += pageSize;
      process.stdout.write(`\r  Fetched ${facilities.length} facilities...`);
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  console.log(`\n\n📊 Found ${facilities.length} indexable facilities\n`);

  // Group by unique key (name + street1 + city + state + phone)
  const groups = new Map<string, Facility[]>();

  for (const facility of facilities) {
    const key = `${facility.name}|${facility.street1 || ''}|${facility.city}|${facility.state}|${facility.phone || ''}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(facility);
  }

  // Find duplicates
  const duplicates: string[] = [];
  let duplicateGroups = 0;

  for (const [key, group] of groups) {
    if (group.length > 1) {
      duplicateGroups++;
      // Keep the first one (highest DQS since we ordered by dqs desc)
      // Mark the rest for deletion
      for (let i = 1; i < group.length; i++) {
        duplicates.push(group[i].id);
      }
    }
  }

  console.log(`📋 Found ${duplicateGroups} duplicate groups`);
  console.log(`🗑️  ${duplicates.length} facilities to remove\n`);

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found!');
    return;
  }

  // Delete duplicates in batches
  const batchSize = 100;
  let deleted = 0;

  for (let i = 0; i < duplicates.length; i += batchSize) {
    const batch = duplicates.slice(i, i + batchSize);

    const { error: deleteError } = await supabase
      .from('facilities')
      .delete()
      .in('id', batch);

    if (deleteError) {
      console.error(`Error deleting batch ${i / batchSize + 1}:`, deleteError);
    } else {
      deleted += batch.length;
      process.stdout.write(`\r  Deleted ${deleted}/${duplicates.length} duplicates...`);
    }
  }

  console.log(`\n\n✅ Removed ${deleted} duplicate facilities`);

  // Verify
  const { count: newCount } = await supabase
    .from('facilities')
    .select('*', { count: 'exact', head: true })
    .eq('is_indexable', true);

  console.log(`\n📊 New indexable count: ${newCount}`);
}

dedupeFacilities().catch(console.error);
