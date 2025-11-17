/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

// Cron jobs will be initialized in a separate file that runs after build
// See lib/cron-init.ts for initialization

module.exports = nextConfig



