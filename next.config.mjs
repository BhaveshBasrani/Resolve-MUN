/** @type {import('next').NextConfig} */
const isExport = process.env.BUILD_TARGET === 'export' || process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  output: isExport ? 'export' : undefined,
  trailingSlash: true,
  allowedDevOrigins: ['192.168.88.7', '192.168.88.4', 'localhost:3000'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'resolvemun.in',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  ...(isExport
    ? {}
    : {
        async headers() {
          return [
            {
              source: '/(.*)',
              headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'X-XSS-Protection', value: '1; mode=block' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
