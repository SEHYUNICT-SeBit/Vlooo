/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
