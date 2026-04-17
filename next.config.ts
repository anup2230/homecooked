import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src 'self' https://fonts.gstatic.com`,
      `img-src 'self' blob: data: https://placehold.co https://images.unsplash.com https://lh3.googleusercontent.com`,
      `frame-src https://js.stripe.com https://hooks.stripe.com`,
      `connect-src 'self' https://api.stripe.com`,
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // Required for Docker standalone deployment
  output: 'standalone',

  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google OAuth avatars
      // Add your R2/S3 bucket hostname here when configured:
      // { protocol: 'https', hostname: '*.r2.dev' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:9002'],
    },
  },
};

export default nextConfig;
