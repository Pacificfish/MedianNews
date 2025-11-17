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

// Initialize cron jobs on server start (Railway-compatible)
if (typeof window === "undefined" && (process.env.ENABLE_CRON === "true" || process.env.NODE_ENV === "production")) {
  try {
    const { initializeCronJobs } = require("./lib/cron");
    initializeCronJobs();
  } catch (error) {
    console.error("Failed to initialize cron jobs:", error);
  }
}

module.exports = nextConfig



