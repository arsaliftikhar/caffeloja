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
  async rewrites() {
    return [
      {
        source: '/wp-content/uploads/2018/04/title-separator.png',
        destination: '/images/title-separator.svg',
      },
    ];
  },
};

module.exports = nextConfig;
