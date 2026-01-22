/**
 * Supabase Database Client for PathToRehab.com
 *
 * CRITICAL: Use @supabase/supabase-js, NOT postgres npm
 * The postgres npm package FAILS from Vercel serverless.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Site configuration
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pathtorehab.com';
export const SITE_NAME = 'Path To Rehab';

// Database types
export interface Facility {
  id: string;
  external_id: string;
  name: string;
  name_alt: string | null;
  slug: string;
  street1: string | null;
  street2: string | null;
  city: string;
  city_slug: string;
  state: string;
  state_name: string;
  zip: string | null;
  phone: string | null;
  intake_phone: string | null;
  hotline: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  facility_type: string | null;
  services: Record<string, string[]> | null;
  type_of_care: string[] | null;
  service_settings: string[] | null;
  payment_options: string[] | null;
  age_groups: string[] | null;
  special_programs: string[] | null;
  dqs: number;
  is_indexable: boolean;
  created_at: string;
  updated_at: string;
}

export interface State {
  id: number;
  code: string;
  name: string;
  slug: string;
  facility_count: number;
}

export interface City {
  id: number;
  name: string;
  slug: string;
  state_code: string;
  facility_count: number;
  latitude: number | null;
  longitude: number | null;
}

// Query functions
export async function getFacilityBySlug(slug: string): Promise<Facility | null> {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching facility:', error);
    return null;
  }
  return data;
}

export async function getFacilitiesByState(state: string, limit = 20): Promise<Facility[]> {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('state', state)
    .eq('is_indexable', true)
    .order('dqs', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching facilities:', error);
    return [];
  }
  return data || [];
}

export async function getFacilitiesByCity(stateCode: string, citySlug: string, limit = 50): Promise<Facility[]> {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('state', stateCode)
    .eq('city_slug', citySlug)
    .eq('is_indexable', true)
    .order('dqs', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching facilities:', error);
    return [];
  }
  return data || [];
}

export async function getAllStates(): Promise<State[]> {
  const { data, error } = await supabase
    .from('states')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching states:', error);
    return [];
  }
  return data || [];
}

export async function getStateBySlug(slug: string): Promise<State | null> {
  const { data, error } = await supabase
    .from('states')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching state:', error);
    return null;
  }
  return data;
}

export async function getCityBySlug(stateCode: string, citySlug: string): Promise<City | null> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('state_code', stateCode)
    .eq('slug', citySlug)
    .single();

  if (error) {
    console.error('Error fetching city:', error);
    return null;
  }
  return data;
}

export async function getCitiesByState(stateCode: string): Promise<City[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('state_code', stateCode)
    .gt('facility_count', 0)
    .order('facility_count', { ascending: false });

  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
  return data || [];
}

export async function getTotalIndexableCount(): Promise<number> {
  const { count, error } = await supabase
    .from('facilities')
    .select('*', { count: 'exact', head: true })
    .eq('is_indexable', true);

  if (error) {
    console.error('Error fetching count:', error);
    return 0;
  }
  return count || 0;
}

// Batch query for >1000 rows (sitemap, exports)
export async function getAllIndexableSlugs(): Promise<string[]> {
  const allSlugs: string[] = [];
  let offset = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('facilities')
      .select('slug')
      .eq('is_indexable', true)
      .range(offset, offset + batchSize - 1);

    if (error || !data || data.length === 0) break;

    allSlugs.push(...data.map(d => d.slug));
    offset += batchSize;

    if (data.length < batchSize) break;
  }

  return allSlugs;
}
