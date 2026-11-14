/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
