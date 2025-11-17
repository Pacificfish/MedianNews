import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const searchTerm = query.trim().toLowerCase();

  try {
    // Search topics by title
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select(`
        id,
        title,
        first_seen_at,
        last_seen_at
      `)
      .ilike("title", `%${searchTerm}%`)
      .order("last_seen_at", { ascending: false })
      .limit(20);

    if (topicsError) {
      console.error("Error searching topics:", topicsError);
    }

    // Search articles by title
    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select(`
        id,
        title,
        url,
        summary,
        published_at,
        sources!inner(name)
      `)
      .ilike("title", `%${searchTerm}%`)
      .order("published_at", { ascending: false })
      .limit(20);

    if (articlesError) {
      console.error("Error searching articles:", articlesError);
    }

    // Get article counts for topics
    const topicIds = (topics || []).map(t => t.id);
    let topicStats = new Map();
    
    if (topicIds.length > 0) {
      const { data: members } = await supabase
        .from("topic_members")
        .select(`
          topic_id,
          side_label,
          articles!inner(sources!inner(id))
        `)
        .in("topic_id", topicIds);

      if (members) {
        members.forEach((m: any) => {
          const topicId = m.topic_id;
          if (!topicStats.has(topicId)) {
            topicStats.set(topicId, { left: 0, center: 0, right: 0, sources: new Set() });
          }
          const stats = topicStats.get(topicId)!;
          if (m.side_label === "Left") stats.left++;
          else if (m.side_label === "Center") stats.center++;
          else if (m.side_label === "Right") stats.right++;
          if (m.articles?.sources?.id) stats.sources.add(m.articles.sources.id);
        });
      }
    }

    const topicsWithStats = (topics || []).map((topic: any) => {
      const stats = topicStats.get(topic.id) || { left: 0, center: 0, right: 0, sources: new Set() };
      return {
        ...topic,
        leftCount: stats.left,
        centerCount: stats.center,
        rightCount: stats.right,
        totalSources: stats.sources.size,
        hasIncompleteCoverage: stats.left === 0 || stats.center === 0 || stats.right === 0,
      };
    });

    return NextResponse.json({
      topics: topicsWithStats,
      articles: articles || [],
      query: searchTerm,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}

