/** @type {import('next').NextConfig} */
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(/\/api$/, '');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@saghf/types', '@saghf/config'],
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 430, 640, 768, 1024, 1280, 1440, 1920],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/api/media/**' },
      { protocol: 'https', hostname: '**', pathname: '/api/media/**' },
    ],
  },
  async rewrites() {
    // Uploaded media is served by the API; proxying keeps image URLs same-origin.
    return [{ source: '/api/media/:path*', destination: `${apiOrigin}/api/media/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
