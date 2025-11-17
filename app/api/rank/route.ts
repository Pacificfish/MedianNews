import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  // This should be called by Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Get all topics
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("id");

    if (topicsError || !topics) {
      throw new Error("Failed to fetch topics");
    }

    let processed = 0;

    for (const topic of topics) {
      // Get articles in this topic
      const { data: members } = await supabase
        .from("topic_members")
        .select(`
          article_id,
          articles!inner(
            id,
            published_at,
            source_id,
            sources!inner(authority_score)
          )
        `)
        .eq("topic_id", topic.id);

      if (!members || members.length === 0) continue;

      // Calculate rank signals for each article
      for (const member of members) {
        const article = member.articles;
        if (!article) continue;

        const now = new Date();
        const publishedAt = new Date(article.published_at);
        const hoursSincePublished = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);

        // Recency: exponential decay (half-life of 24 hours)
        const recency = Math.exp(-hoursSincePublished / 24);

        // Authority: from source
        const authority = article.sources?.authority_score || 0.5;

        // Coverage: number of distinct sources in topic (normalized)
        const distinctSources = new Set(
          members.map((m: any) => m.articles?.source_id).filter(Boolean)
        ).size;
        const coverage = Math.min(distinctSources / 10, 1);

        // Engagement: placeholder (would come from analytics)
        const engagement = 0.5;

        // Geo: neutral for now
        const geo = 0.5;

        // Novelty: placeholder
        const novelty = 0.8;

        // Weighted total score
        const totalScore =
          recency * 0.3 +
          authority * 0.25 +
          coverage * 0.2 +
          engagement * 0.1 +
          geo * 0.05 +
          novelty * 0.1;

        // Upsert rank signal
        await supabase.from("rank_signals").upsert({
          article_id: article.id,
          recency,
          authority,
          coverage,
          engagement,
          geo,
          novelty,
          total_score: totalScore,
          computed_at: now.toISOString(),
        });

        processed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
    });
  } catch (error: any) {
    console.error("Rank error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}



