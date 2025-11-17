// Server-side cron initialization for Railway
// This file is imported when the server starts

if (typeof window === "undefined") {
  try {
    require("./lib/cron-init");
  } catch (error) {
    // Silently fail during build or if module not found
    if (process.env.NODE_ENV === "production") {
      console.error("Failed to initialize cron jobs:", error);
    }
  }
}

