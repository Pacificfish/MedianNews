import { NextRequest, NextResponse } from "next/server";
import { initializeCronJobs } from "@/lib/cron";

// This endpoint can be called to manually initialize cron jobs
// Useful for Railway or other platforms that need explicit initialization

export async function GET(request: NextRequest) {
  try {
    initializeCronJobs();
    return NextResponse.json({
      success: true,
      message: "Cron jobs initialized",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to initialize cron jobs", message: error.message },
      { status: 500 }
    );
  }
}

