import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { event, articleId, metadata } = await request.json();

    if (!event || !articleId) {
      return NextResponse.json(
        { error: "event and articleId are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const adminSupabase = createAdminClient();

    // Track view
    if (event === "view") {
      // Could increment a counter or log to analytics table
      // For now, we'll just return success
    }

    // Track click
    if (event === "click") {
      // Log click event
    }

    // Track dwell time
    if (event === "dwell" && metadata?.dwellMs) {
      if (user) {
        await adminSupabase.from("user_reads").upsert({
          user_id: user.id,
          article_id: articleId,
          dwell_ms: metadata.dwellMs,
          ts: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Track error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}



