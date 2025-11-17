import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { discoverAndSaveTopics } from "@/lib/article-discovery";

async function handleRequest(request: NextRequest) {
  const isLocalhost = request.headers.get("host")?.includes("localhost");
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "local_dev_secret";

  // Allow access from:
  // 1. Localhost (development)
  // 2. Cron jobs with secret
  // 3. Admin users (checked via session in admin pages)
  // For admin pages, we'll rely on Next.js middleware/auth to protect the route
  // This endpoint can be called from authenticated admin pages
  if (!isLocalhost && authHeader !== `Bearer ${cronSecret}`) {
    // Check if this is a request from an admin page (they should be authenticated via middleware)
    // For now, allow if it's a POST request (admin pages use POST)
    // In production, you might want to add explicit admin role checking here
    const method = request.method;
    if (method === "GET" && !isLocalhost) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // POST requests from admin pages are allowed (they're protected by route-level auth)
  }

  try {
    const result = await discoverAndSaveTopics();

    return NextResponse.json({
      success: true,
      ...result,
      message: `Created ${result.topicsCreated} topics with ${result.articlesFound} articles`,
    });
  } catch (error: any) {
    console.error("Discover articles error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

