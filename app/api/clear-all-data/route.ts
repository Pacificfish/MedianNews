import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const isLocalhost = request.headers.get("host")?.includes("localhost");
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "local_dev_secret";
  
  if (!isLocalhost && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Delete in order to respect foreign key constraints
    // Using admin client, we can delete all rows
    // 1. Delete topic_members (references topics and articles)
    // Note: topic_members has composite PK (topic_id, article_id), no id column
    const { error: membersError } = await supabase
      .from("topic_members")
      .delete()
      .neq("topic_id", "00000000-0000-0000-0000-000000000000"); // Matches all rows

    if (membersError) {
      console.error("Error deleting topic_members:", membersError);
      throw new Error(`Failed to delete topic_members: ${membersError.message}`);
    }

    // 2. Delete bias_scores (references articles)
    // Note: bias_scores has article_id as PK, not id
    const { error: biasError } = await supabase
      .from("bias_scores")
      .delete()
      .neq("article_id", "00000000-0000-0000-0000-000000000000"); // Matches all rows

    if (biasError) {
      console.error("Error deleting bias_scores:", biasError);
      throw new Error(`Failed to delete bias_scores: ${biasError.message}`);
    }

    // 3. Delete topics
    const { error: topicsError } = await supabase
      .from("topics")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Matches all rows

    if (topicsError) {
      console.error("Error deleting topics:", topicsError);
      throw new Error(`Failed to delete topics: ${topicsError.message}`);
    }

    // 4. Delete homepage_topics
    const { error: homepageError } = await supabase
      .from("homepage_topics")
      .delete()
      .neq("topic_id", "00000000-0000-0000-0000-000000000000"); // Matches all rows

    if (homepageError) {
      console.error("Error deleting homepage_topics:", homepageError);
      throw new Error(`Failed to delete homepage_topics: ${homepageError.message}`);
    }

    // 5. Delete articles
    const { error: articlesError } = await supabase
      .from("articles")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Matches all rows

    if (articlesError) {
      console.error("Error deleting articles:", articlesError);
      throw new Error(`Failed to delete articles: ${articlesError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "All articles, topics, and homepage data have been deleted",
    });
  } catch (error: any) {
    console.error("Clear all data error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

