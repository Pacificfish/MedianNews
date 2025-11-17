import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function handleRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "local_dev_secret";

  const isLocalhost = request.headers.get("host")?.includes("localhost");

  if (!isLocalhost && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

    let topicsProcessed = 0;
    let homepageEntriesCreated = 0;
    let errors = 0;

    // 1. Get topics that have been active in the last 24 hours
    const { data: recentTopics, error: topicsError } = await supabase
      .from("topics")
      .select(`
        id,
        title,
        first_seen_at,
        last_seen_at,
        topic_members(
          side_label,
          articles(
            id,
            title,
            url,
            published_at,
            sources(authority_score),
            bias_scores(leaning, score, confidence)
          )
        )
      `)
      .gte("last_seen_at", twentyFourHoursAgo)
      .order("last_seen_at", { ascending: false })
      .limit(100);

    if (topicsError) {
      console.error("Error fetching recent topics:", topicsError);
      throw new Error(`Failed to fetch recent topics: ${topicsError.message}`);
    }

    for (const topic of recentTopics || []) {
      topicsProcessed++;
      let leftArticleId: string | null = null;
      let centerArticleId: string | null = null;
      let rightArticleId: string | null = null;
      let blindspotSide: "Left" | "Center" | "Right" | null = null;

      const members = topic.topic_members || [];
      const articlesBySide: { [key: string]: any[] } = {
        Left: [],
        Center: [],
        Right: [],
      };

      // Group articles by side
      members.forEach((member: any) => {
        if (member.articles && member.side_label) {
          articlesBySide[member.side_label].push({
            ...member.articles,
            source_authority: member.articles.sources?.authority_score || 0,
            bias_confidence: member.articles.bias_scores?.[0]?.confidence || 0,
          });
        }
      });

      // Function to select the best article for a side
      const selectBestArticle = (side: "Left" | "Center" | "Right") => {
        const candidates = articlesBySide[side];
        if (candidates.length === 0) return null;

        // Rank by bias confidence (desc), then source authority (desc), then published_at (desc)
        candidates.sort((a, b) => {
          if (b.bias_confidence !== a.bias_confidence) return b.bias_confidence - a.bias_confidence;
          if (b.source_authority !== a.source_authority) return b.source_authority - a.source_authority;
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        });
        return candidates[0].id;
      };

      leftArticleId = selectBestArticle("Left");
      centerArticleId = selectBestArticle("Center");
      rightArticleId = selectBestArticle("Right");

      // Determine blindspot
      if (!leftArticleId) blindspotSide = "Left";
      else if (!centerArticleId) blindspotSide = "Center";
      else if (!rightArticleId) blindspotSide = "Right";

      // Compute importance score with improved algorithm
      const distinctSources = new Set(members.map((m: any) => m.articles?.sources?.name)).filter(Boolean).size;
      const totalArticles = members.length;
      
      // Coverage: More sources = better (normalized to 0-1, cap at 15 sources)
      const coverageWeight = Math.min(distinctSources / 15, 1);
      
      // Article volume: More articles = more important (normalized, cap at 20 articles)
      const volumeWeight = Math.min(totalArticles / 20, 1);

      // Find latest article time
      const allArticleTimes = members
        .map((m: any) => m.articles?.published_at)
        .filter(Boolean)
        .map((date: string) => new Date(date).getTime());
      
      const latestArticleTime = allArticleTimes.length > 0 ? Math.max(...allArticleTimes) : 0;
      const hoursSinceLatest = latestArticleTime > 0 ? (now.getTime() - latestArticleTime) / (1000 * 60 * 60) : 999;
      
      // Recency: Exponential decay with half-life of 6 hours (faster decay for breaking news)
      const recencyWeight = Math.exp(-hoursSinceLatest / 6);

      // Authority: Average source authority score
      const allSourceAuthorities = members
        .map((m: any) => m.articles?.sources?.authority_score)
        .filter((score: any) => score !== undefined && score !== null) as number[];
      const meanAuthority = allSourceAuthorities.length > 0
        ? allSourceAuthorities.reduce((sum, score) => sum + score, 0) / allSourceAuthorities.length
        : 0;
      const authorityWeight = meanAuthority;

      // Perspective balance: Topics with all 3 perspectives score higher
      const hasAllPerspectives = leftArticleId && centerArticleId && rightArticleId;
      const balanceWeight = hasAllPerspectives ? 1.0 : 0.6;

      // Engagement: Placeholder (would come from analytics)
      const engagementWeight = 0;

      // Weighted importance score (prioritize recency and coverage)
      const importanceScore =
        0.35 * recencyWeight +      // Breaking news gets priority
        0.25 * coverageWeight +     // More sources = more important
        0.15 * volumeWeight +       // More articles = more coverage
        0.15 * authorityWeight +    // Higher quality sources
        0.05 * balanceWeight +      // All perspectives present
        0.05 * engagementWeight;    // User engagement (future)

      // Upsert into homepage_topics
      const { error: upsertError } = await supabase
        .from("homepage_topics")
        .upsert({
          topic_id: topic.id,
          title: topic.title,
          left_article_id: leftArticleId,
          center_article_id: centerArticleId,
          right_article_id: rightArticleId,
          blindspot_side: blindspotSide,
          importance_score: importanceScore,
          built_at: now.toISOString(),
        }, { onConflict: "topic_id" });

      if (upsertError) {
        console.error(`Error upserting homepage_topic for topic ${topic.id}:`, upsertError);
        errors++;
      } else {
        homepageEntriesCreated++;
      }
    }

    // 2. Prune old rows (>48h) from homepage_topics
    const { error: pruneError } = await supabase
      .from("homepage_topics")
      .delete()
      .lt("built_at", fortyEightHoursAgo);

    if (pruneError) {
      console.error("Error pruning old homepage topics:", pruneError);
      errors++;
    }

    return NextResponse.json({
      success: true,
      topicsProcessed,
      homepageEntriesCreated,
      builtAt: now.toISOString(),
      message: `Homepage rebuilt. Processed ${topicsProcessed} topics, created ${homepageEntriesCreated} entries.`,
    });

  } catch (error: any) {
    console.error("Rebuild homepage error:", error);
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

