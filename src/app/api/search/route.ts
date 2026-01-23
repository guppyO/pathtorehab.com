import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() || '';
  const stateFilter = request.nextUrl.searchParams.get('state')?.trim().toUpperCase() || '';
  const cityFilter = request.nextUrl.searchParams.get('city')?.trim() || '';

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // Search by facility name only (not city/state - those are filters)
  const searchTerm = `%${q}%`;

  let query = supabase
    .from('facilities')
    .select('id, name, city, state, slug, facility_type')
    .eq('is_indexable', true)
    .ilike('name', searchTerm);

  // Apply state filter if provided
  if (stateFilter) {
    query = query.eq('state', stateFilter);
  }

  // Apply city filter if provided
  if (cityFilter) {
    query = query.eq('city_slug', cityFilter);
  }

  const { data, error } = await query
    .order('dqs', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [], error: error.message });
  }

  return NextResponse.json({ results: data || [] });
}
