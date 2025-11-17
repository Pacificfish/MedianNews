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
    console.log("Starting article discovery process...");
    
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    
    const result = await discoverAndSaveTopics();

    console.log("Discovery complete:", result);

    return NextResponse.json({
      success: true,
      ...result,
      message: result.topicsCreated > 0 
        ? `Created ${result.topicsCreated} topics with ${result.articlesFound} articles`
        : `Discovery completed but found 0 topics. Check logs for details. Topics discovered: ${result.topicsDiscovered}`,
    });
  } catch (error: any) {
    console.error("Discover articles error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        details: error.stack || "No additional details",
      },
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

