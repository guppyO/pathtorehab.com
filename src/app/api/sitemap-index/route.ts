/**
 * Sitemap Index Route for PathToRehab.com
 *
 * Returns a sitemap index that references individual sitemap files.
 * Accessed via /sitemap.xml (rewrite in next.config.ts)
 */

import { NextResponse } from 'next/server';
import { supabase, SITE_URL } from '@/lib/db';

export const dynamic = 'force-dynamic';

const URLS_PER_SITEMAP = 5000;

export async function GET(): Promise<Response> {
  // Get total indexable count
  const { count, error } = await supabase
    .from('facilities')
    .select('*', { count: 'exact', head: true })
    .eq('is_indexable', true);

  if (error) {
    console.error('Sitemap index error:', error);
    return new NextResponse('Error generating sitemap index', { status: 500 });
  }

  const totalUrls = count || 0;
  const numSitemaps = Math.ceil(totalUrls / URLS_PER_SITEMAP) || 1;
  const lastmod = new Date().toISOString();

  const entries = Array.from({ length: numSitemaps }, (_, i) => `  <sitemap>
    <loc>${SITE_URL}/sitemap/${i}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
