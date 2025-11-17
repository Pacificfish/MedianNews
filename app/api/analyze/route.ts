import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { classifyBias } from "@/lib/openai";
import { normalizeUrl, hashString } from "@/lib/utils";
import * as cheerio from "cheerio";

async function fetchAndParseArticle(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MedianNews/1.0 (Article Analyzer)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $("title").first().text().trim() || 
                  $('meta[property="og:title"]').attr("content") || 
                  $("h1").first().text().trim();
    
    const description = $('meta[name="description"]').attr("content") ||
                       $('meta[property="og:description"]').attr("content") ||
                       $("p").first().text().trim().substring(0, 300);

    const publishedAt = $('meta[property="article:published_time"]').attr("content") ||
                       $('time[datetime]').attr("datetime") ||
                       new Date().toISOString();

    return {
      title,
      summary: description,
      publishedAt,
    };
  } catch (error) {
    // Fallback to basic parsing
    return {
      title: new URL(url).hostname,
      summary: "",
      publishedAt: new Date().toISOString(),
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(url);
    const supabase = createAdminClient();

    // Check cache (articles table) - check if article exists first
    const { data: existingArticle } = await supabase
      .from("articles")
      .select(`
        id,
        title,
        url,
        summary,
        published_at,
        sources!inner(name, bias_label),
        bias_scores(leaning, score, confidence, explanation)
      `)
      .eq("url", normalizedUrl)
      .single();

    // If article exists and has bias score, return cached result
    if (existingArticle) {
      if (existingArticle.bias_scores && existingArticle.bias_scores.length > 0) {
        const bias = existingArticle.bias_scores[0];
        return NextResponse.json({
          article: {
            id: existingArticle.id,
            title: existingArticle.title,
            url: existingArticle.url,
            summary: existingArticle.summary,
            published_at: existingArticle.published_at,
            sources: existingArticle.sources,
          },
          bias: {
            leaning: bias.leaning,
            score: bias.score,
            confidence: bias.confidence,
            explanation: bias.explanation,
          },
        });
      }
      // Article exists but no bias score - we'll classify it below
    }

    // Fetch and parse article
    const parsed = await fetchAndParseArticle(url);
    
    // Try to find source by domain
    const domain = new URL(url).hostname.replace("www.", "");
    const { data: source } = await supabase
      .from("sources")
      .select("*")
      .or(`home_url.ilike.%${domain}%,rss_url.ilike.%${domain}%`)
      .eq("active", true)
      .single();

    let sourceId = source?.id;
    if (!sourceId) {
      // Create a temporary source entry
      const { data: newSource } = await supabase
        .from("sources")
        .insert({
          name: domain,
          home_url: `https://${domain}`,
          rss_url: "",
          bias_label: "Center",
          authority_score: 0.5,
          country: "US",
          language: "en",
          active: true,
        })
        .select()
        .single();
      sourceId = newSource?.id;
    }

    if (!sourceId) {
      throw new Error("Failed to create source");
    }

    // Insert or update article (use upsert to handle existing articles)
    const articleHash = hashString(parsed.title + domain);
    let article;
    
    if (existingArticle) {
      // Article already exists, but we need to ensure sources are loaded
      const { data: articleWithSource } = await supabase
        .from("articles")
        .select(`
          id,
          title,
          url,
          summary,
          published_at,
          sources!inner(name, bias_label)
        `)
        .eq("id", existingArticle.id)
        .single();
      
      if (articleWithSource) {
        article = articleWithSource;
      } else {
        article = existingArticle;
      }
    } else {
      // Insert new article
      const { data: newArticle, error: articleError } = await supabase
        .from("articles")
        .insert({
          source_id: sourceId,
          url: normalizedUrl,
          canonical_url: normalizedUrl,
          title: parsed.title,
          summary: parsed.summary,
          content_excerpt: parsed.summary.substring(0, 500),
          published_at: parsed.publishedAt,
          lang: "en",
          hash: articleHash,
        })
        .select(`
          id,
          title,
          url,
          summary,
          published_at,
          sources!inner(name, bias_label)
        `)
        .single();

      if (articleError || !newArticle) {
        // If insert fails due to duplicate, try to fetch the existing one
        const { data: fetchedArticle } = await supabase
          .from("articles")
          .select(`
            id,
            title,
            url,
            summary,
            published_at,
            sources!inner(name, bias_label)
          `)
          .eq("url", normalizedUrl)
          .single();
        
        if (!fetchedArticle) {
          throw new Error("Failed to save article");
        }
        article = fetchedArticle;
      } else {
        article = newArticle;
      }
    }

    // Classify bias
    let biasResult;
    try {
      biasResult = await classifyBias(
        parsed.title,
        parsed.summary,
        source?.bias_label,
        parsed.summary
      );
    } catch (error) {
      // Fallback to source bias
      biasResult = {
        leaning: (source?.bias_label === "Left" || source?.bias_label === "Center-Left"
          ? "Left"
          : source?.bias_label === "Right" || source?.bias_label === "Center-Right"
          ? "Right"
          : "Center") as "Left" | "Center" | "Right",
        score: 50,
        confidence: 50,
        explanation: "Classification based on source bias",
      };
    }

    // Save bias score (use upsert to handle existing scores)
    await supabase.from("bias_scores").upsert({
      article_id: article.id,
      leaning: biasResult.leaning,
      score: biasResult.score,
      confidence: biasResult.confidence,
      explanation: biasResult.explanation,
    }, {
      onConflict: 'article_id'
    });

    return NextResponse.json({
      article: {
        id: article.id,
        title: article.title,
        url: article.url,
        summary: article.summary,
        published_at: article.published_at,
        sources: article.sources,
      },
      bias: biasResult,
    });
  } catch (error: any) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

