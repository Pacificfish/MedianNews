import { NextRequest, NextResponse } from "next/server";

// This endpoint runs twice daily via Vercel Cron
// It discovers new topics/articles and rebuilds the homepage

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const isLocalhost = request.headers.get("host")?.includes("localhost");
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "local_dev_secret";

    if (!isLocalhost && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting daily article discovery and update...");

    // Step 1: Discover new topics and articles
    const discoverResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/discover-articles`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      }
    );

    if (!discoverResponse.ok) {
      const errorText = await discoverResponse.text();
      console.error("Error discovering articles:", errorText);
      return NextResponse.json(
        { error: "Failed to discover articles", details: errorText },
        { status: 500 }
      );
    }

    const discoverResult = await discoverResponse.json();
    console.log("Discovery result:", discoverResult);

    // Step 2: Rebuild homepage with new topics
    const rebuildResponse = await fetch(
      `${siteUrl}/api/rebuild-homepage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CRON_SECRET || "local_dev_secret"}`,
        },
      }
    );

    if (!rebuildResponse.ok) {
      const errorText = await rebuildResponse.text();
      console.error("Error rebuilding homepage:", errorText);
      return NextResponse.json(
        { error: "Failed to rebuild homepage", details: errorText },
        { status: 500 }
      );
    }

    const rebuildResult = await rebuildResponse.json();
    console.log("Rebuild result:", rebuildResult);

    return NextResponse.json({
      success: true,
      message: "Daily update completed successfully",
      discovery: discoverResult,
      rebuild: rebuildResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

