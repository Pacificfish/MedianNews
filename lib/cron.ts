import * as cron from "node-cron";

// Railway-compatible cron job scheduler
// This runs scheduled tasks within the Next.js application

let cronJobsInitialized = false;

export function initializeCronJobs() {
  if (cronJobsInitialized) {
    console.log("Cron jobs already initialized");
    return;
  }

  // Only run cron jobs in production or when explicitly enabled
  const shouldRunCron = process.env.ENABLE_CRON === "true" || process.env.NODE_ENV === "production";

  if (!shouldRunCron) {
    console.log("Cron jobs disabled (set ENABLE_CRON=true to enable)");
    return;
  }

  console.log("Initializing cron jobs...");

  // Run twice daily at 6 AM and 6 PM UTC
  // Schedule: 0 6,18 * * * (minute hour day month weekday)
  cron.schedule("0 6,18 * * *", async () => {
    console.log("Running scheduled article discovery and update...");
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const cronSecret = process.env.CRON_SECRET || "local_dev_secret";

      const response = await fetch(`${siteUrl}/api/cron/discover-and-update`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cronSecret}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cron job failed:", errorText);
      } else {
        const result = await response.json();
        console.log("Cron job completed successfully:", result);
      }
    } catch (error: any) {
      console.error("Error running cron job:", error);
    }
  });

  cronJobsInitialized = true;
  console.log("Cron jobs initialized successfully");
}

