/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Skew protection: on Vercel, requests with mismatched deployment IDs or stale chunks trigger hard navigation instead of crashing with ChunkLoadError
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || undefined,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'caffeloja.com' },
      { protocol: 'https', hostname: 'oldchicagocoffee.com' },
      { protocol: 'https', hostname: 'i0.wp.com' },
    ],
  },
};

module.exports = nextConfig;
