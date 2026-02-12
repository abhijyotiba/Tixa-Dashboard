/** @type {import('next').NextConfig} */
const nextConfig = {
  // We will handle the proxy manually via Route Handler, so no rewrites needed here.
  
  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimize package imports - tree-shakes these heavy libraries
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts', 
      'date-fns',
      '@supabase/supabase-js',
    ],
  },

  // Enable modern image formats
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // PoweredByHeader is unnecessary bytes
  poweredByHeader: false,
};

module.exports = nextConfig
