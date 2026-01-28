/**
 * Robots.txt for PathToRehab.com
 */

import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pathtorehab.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Googlebot-specific rules (prioritized)
      {
        userAgent: 'Googlebot',
        allow: ['/', '/facility/', '/state/', '/city/', '/treatment/', '/browse/', '/search'],
        disallow: ['/api/', '/admin/'],
      },
      // Default rules for all other bots
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      // Block AI training bots
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },
      {
        userAgent: 'ClaudeBot',
        disallow: ['/'],
      },
    ],
    // Only link to sitemap INDEX - Google discovers sub-sitemaps automatically
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
