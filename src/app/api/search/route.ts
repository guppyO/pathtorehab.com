import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() || '';
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // Search by name, city, or state
  // Use ilike for case-insensitive partial matching
  const searchTerm = `%${q}%`;

  const { data, error } = await supabase
    .from('facilities')
    .select('id, name, city, state, slug, facility_type')
    .eq('is_indexable', true)
    .or(`name.ilike.${searchTerm},city.ilike.${searchTerm},state.ilike.${searchTerm}`)
    .order('dqs', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [], error: error.message });
  }

  return NextResponse.json({ results: data || [] });
}
