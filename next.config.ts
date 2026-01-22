import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Sitemap rewrite: /sitemap.xml -> /api/sitemap-index
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap-index',
      },
    ];
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
