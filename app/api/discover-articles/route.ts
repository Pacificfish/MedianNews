import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { discoverAndSaveTopics } from "@/lib/article-discovery";

async function handleRequest(request: NextRequest) {
  const isLocalhost = request.headers.get("host")?.includes("localhost");
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "local_dev_secret";

  if (!isLocalhost && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

