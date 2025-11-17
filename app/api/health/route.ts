import { NextResponse } from "next/server";

// Health check endpoint that also initializes cron jobs on first call
let cronInitialized = false;

export async function GET() {
  // Initialize cron jobs on first health check (server startup)
  if (!cronInitialized && typeof window === "undefined") {
    try {
      const { initializeCronJobs } = await import("@/lib/cron");
      initializeCronJobs();
      cronInitialized = true;
    } catch (error) {
      console.error("Failed to initialize cron jobs:", error);
    }
  }

  return NextResponse.json({ status: "ok", cronInitialized });
}

