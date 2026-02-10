/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  
  // Cloudflare Pages 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
    // Cloudflare Images 사용 시
    loader: process.env.NODE_ENV === 'production' ? 'custom' : 'default',
    loaderFile: './src/utils/imageLoader.ts',
  },
  
  // Edge Runtime 지원
  experimental: {
    runtime: 'experimental-edge',
  },
};

module.exports = nextConfig;
