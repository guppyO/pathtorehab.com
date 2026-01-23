import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() || '';
  const stateCode = request.nextUrl.searchParams.get('state')?.trim().toUpperCase() || '';

  if (!stateCode) {
    return NextResponse.json({ results: [], error: 'State code required' });
  }

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // Search cities by name within a state
  const searchTerm = `%${q}%`;

  const { data, error } = await supabase
    .from('cities')
    .select('id, name, slug, state_code, facility_count')
    .eq('state_code', stateCode)
    .ilike('name', searchTerm)
    .order('facility_count', { ascending: false })
    .limit(20);

  if (error) {
    console.error('City search error:', error);
    return NextResponse.json({ results: [], error: error.message });
  }

  return NextResponse.json({ results: data || [] });
}
