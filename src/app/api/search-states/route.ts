import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() || '';
  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // Search states by name or code
  const searchTerm = `%${q}%`;

  const { data, error } = await supabase
    .from('states')
    .select('id, code, name, slug, facility_count')
    .or(`name.ilike.${searchTerm},code.ilike.${searchTerm}`)
    .order('facility_count', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Search states error:', error);
    return NextResponse.json({ results: [], error: error.message });
  }

  return NextResponse.json({ results: data || [] });
}
