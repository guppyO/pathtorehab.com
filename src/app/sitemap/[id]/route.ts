/**
 * Dynamic Sitemap Route for PathToRehab.com
 *
 * CRITICAL: Do NOT use Next.js built-in sitemap.ts with generateSitemaps()
 * The id parameter is unreliable. Use this custom route pattern instead.
 *
 * URL pattern: /sitemap/0.xml, /sitemap/1.xml, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, SITE_URL } from '@/lib/db';

export const dynamic = 'force-dynamic';

const URLS_PER_SITEMAP = 5000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const idParam = resolvedParams.id.replace('.xml', '');
  const sitemapId = parseInt(idParam, 10);

  if (isNaN(sitemapId) || sitemapId < 0) {
    return new NextResponse('Invalid sitemap ID', { status: 400 });
  }

  // CRITICAL: Batch queries in chunks of 1000 (Supabase limit)
  const urls: string[] = [];
  let offset = sitemapId * URLS_PER_SITEMAP;
  const targetCount = URLS_PER_SITEMAP;

  while (urls.length < targetCount) {
    const batchSize = Math.min(1000, targetCount - urls.length);
    const { data, error } = await supabase
      .from('facilities')
      .select('slug, state, city_slug, updated_at')
      .eq('is_indexable', true)
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error('Sitemap error:', error);
      break;
    }

    if (!data || data.length === 0) break;

    urls.push(...data.map(d => {
      const lastmod = d.updated_at ? new Date(d.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      return `  <url>
    <loc>${SITE_URL}/facility/${d.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }));

    offset += batchSize;
    if (data.length < batchSize) break;
  }

  // If this is sitemap 0, also include static pages and hub pages
  if (sitemapId === 0) {
    const staticPages = [
      { loc: SITE_URL, priority: '1.0', changefreq: 'daily' },
      { loc: `${SITE_URL}/browse`, priority: '0.9', changefreq: 'daily' },
      { loc: `${SITE_URL}/privacy`, priority: '0.3', changefreq: 'yearly' },
      { loc: `${SITE_URL}/terms`, priority: '0.3', changefreq: 'yearly' },
    ];

    // Add state pages
    const { data: states } = await supabase
      .from('states')
      .select('slug')
      .order('name');

    if (states) {
      states.forEach(state => {
        staticPages.push({
          loc: `${SITE_URL}/${state.slug}`,
          priority: '0.9',
          changefreq: 'weekly'
        });
      });
    }

    const staticUrls = staticPages.map(p => `  <url>
    <loc>${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`);

    urls.unshift(...staticUrls);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
