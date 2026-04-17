import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required for Docker standalone deployment
  output: 'standalone',

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google OAuth avatars
      // Add your R2/S3 bucket hostname here when configured:
      // { protocol: 'https', hostname: '*.r2.dev' },
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:9002'],
    },
  },

  // Allow Next.js image optimisation to serve from your storage bucket.
  // Add your R2/S3 public URL hostname below:
  // images: {
  //   remotePatterns: [
  //     { protocol: 'https', hostname: 'pub-xxxxxxxx.r2.dev' },
  //   ],
  // },
};

export default nextConfig;
