// Initialize cron jobs after the app starts
// This is called from app/layout.tsx or a server component

import { initializeCronJobs } from "./cron";

// Only initialize in production or when explicitly enabled
if (process.env.ENABLE_CRON === "true" || process.env.NODE_ENV === "production") {
  initializeCronJobs();
}

