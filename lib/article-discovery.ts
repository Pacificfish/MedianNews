import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeUrl, hashString } from "@/lib/utils";
import { classifyBias, discoverPoliticalTopics, PoliticalTopic, generateEmbedding, cosineSimilarity, generateArticleSummary, estimateReadingTime } from "@/lib/openai";
import * as cheerio from "cheerio";
import Parser from "rss-parser";
import { Source } from "@/types";

const parser = new Parser();

interface FoundArticle {
  title: string;
  url: string;
  snippet: string;
  publishedAt?: string;
  source: Source;
}

/**
 * Search Google News for articles about a topic
 * Uses multiple search strategies to get comprehensive, recent results
 */
async function searchGoogleNews(topic: PoliticalTopic): Promise<FoundArticle[]> {
  const foundArticles: FoundArticle[] = [];
  const seenUrls = new Set<string>();
  
  // Generate topic embedding for relevance filtering
  const topicText = `${topic.title} ${topic.description} ${topic.keywords.join(" ")}`;
  let topicEmbedding: number[] | null = null;
  try {
    topicEmbedding = await generateEmbedding(topicText);
  } catch (e) {
    console.warn("Failed to generate topic embedding, skipping relevance filtering");
  }
  
  // Generate comprehensive search queries - use ALL keywords in various combinations
  const searchQueries: string[] = [];
  
  // Add the topic title
  searchQueries.push(topic.title);
  
  // Add all keywords as a single query
  if (topic.keywords.length > 0) {
    searchQueries.push(topic.keywords.join(" "));
  }
  
  // Add keyword combinations of different lengths
  for (let len = Math.min(topic.keywords.length, 8); len >= 2; len--) {
    searchQueries.push(topic.keywords.slice(0, len).join(" "));
  }
  
  // Add quoted phrase searches for exact matches (important keywords)
  const importantKeywords = topic.keywords.slice(0, 4); // First 4 are usually most important
  for (const keyword of importantKeywords) {
    if (keyword.length > 3) { // Only quote keywords longer than 3 chars
      searchQueries.push(`"${keyword}"`);
    }
  }
  
  // Add combinations of 2-3 important keywords
  for (let i = 0; i < Math.min(importantKeywords.length, 3); i++) {
    for (let j = i + 1; j < Math.min(importantKeywords.length, 4); j++) {
      searchQueries.push(`${importantKeywords[i]} ${importantKeywords[j]}`);
    }
  }
  
  // Remove duplicates and empty queries
  const uniqueQueries = Array.from(new Set(searchQueries.filter(q => q.trim().length > 0)));
  console.log(`  Generated ${uniqueQueries.length} search queries for topic: "${topic.title}"`);
  
  // Filter for recent articles (extend to 72 hours to catch more articles)
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - 72);

  // Get all active sources from database (do this once)
  const supabase = createAdminClient();
  const { data: sources } = await supabase
    .from("sources")
    .select("*")
    .eq("active", true);

  if (!sources || sources.length === 0) {
    console.log("No active sources found in database");
    return [];
  }

  // Search with each query - comprehensive search to get ALL articles
  for (let i = 0; i < uniqueQueries.length; i++) {
    const searchQuery = uniqueQueries[i];
    if (!searchQuery.trim()) continue;
    
    // Small delay between queries to avoid rate limiting (except for first query)
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
    }
    
    console.log(`    Searching with query ${i + 1}/${uniqueQueries.length}: "${searchQuery}"`);
    
    // Google News RSS feed URL
    const googleNewsRssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;
    
    try {
      const feed = await parser.parseURL(googleNewsRssUrl);
      
      if (!feed.items || feed.items.length === 0) {
        continue;
      }

      // Process ALL items from the feed (Google News RSS typically returns up to 100 items)
      // Process all items to get comprehensive coverage
      for (const item of feed.items) {
        if (!item.link || !item.title) continue;
        
        // Filter by recency - include articles from last 72 hours
        if (item.pubDate) {
          const pubDate = new Date(item.pubDate);
          if (pubDate < cutoffDate) {
            continue; // Skip articles older than 72 hours
          }
        }

        try {
          // Google News RSS links are redirects, extract actual URL
          // Format: https://news.google.com/rss/articles/...
          let articleUrl = item.link || item.guid;
          
          // Try to extract the actual URL from Google News redirect
          if (articleUrl && articleUrl.includes("news.google.com")) {
            // Try to get the actual URL by fetching the redirect
            try {
              const response = await fetch(articleUrl, {
                method: "HEAD",
                redirect: "follow",
                signal: AbortSignal.timeout(3000),
              });
              articleUrl = response.url;
            } catch (e) {
              // If redirect fails, try to parse from item content or use the link as-is
              // Google News sometimes includes the URL in the content
              if (item.content) {
                const $ = cheerio.load(item.content);
                const link = $("a").first().attr("href");
                if (link && link.startsWith("http")) {
                  articleUrl = link;
                }
              }
            }
          }

          if (!articleUrl || !articleUrl.startsWith("http")) {
            continue; // Skip if we can't get a valid URL
          }

          const normalizedUrl = normalizeUrl(articleUrl);
          
          // Skip if we've already seen this URL
          if (seenUrls.has(normalizedUrl)) {
            continue;
          }
          seenUrls.add(normalizedUrl);

          let domain: string;
          try {
            domain = new URL(normalizedUrl).hostname.replace("www.", "");
          } catch (e) {
            continue; // Skip if URL is invalid
          }

          // Find matching source by domain
          const matchingSource = sources.find(s => {
            try {
              const sourceDomain = new URL(s.home_url).hostname.replace("www.", "");
              return sourceDomain === domain || s.home_url.includes(domain) || s.rss_url.includes(domain);
            } catch (e) {
              return false;
            }
          });

          if (!matchingSource) {
            // Try to match by name in the title or snippet
            const itemText = (item.title + " " + (item.contentSnippet || "")).toLowerCase();
            const nameMatch = sources.find(s => 
              itemText.includes(s.name.toLowerCase())
            );
            
            if (nameMatch) {
              // Verify relevance using embeddings if available
              // Lower threshold (0.70) to catch more relevant articles
              if (topicEmbedding) {
                try {
                  const articleText = `${item.title} ${item.contentSnippet || ""}`;
                  const articleEmbedding = await generateEmbedding(articleText);
                  const similarity = cosineSimilarity(topicEmbedding, articleEmbedding);
                  
                  // Lower threshold to 0.70 (70% similar) to get more articles
                  if (similarity < 0.70) {
                    continue; // Skip irrelevant articles
                  }
                } catch (e) {
                  // If embedding check fails, include the article anyway (better to include than miss)
                }
              }
              
              foundArticles.push({
                title: item.title,
                url: normalizedUrl,
                snippet: item.contentSnippet || item.content || "",
                publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
                source: nameMatch,
              });
            }
            continue;
          }

          // Verify relevance using embeddings if available
          // Lower threshold (0.70) to catch more relevant articles
          if (topicEmbedding) {
            try {
              const articleText = `${item.title} ${item.contentSnippet || ""}`;
              const articleEmbedding = await generateEmbedding(articleText);
              const similarity = cosineSimilarity(topicEmbedding, articleEmbedding);
              
              // Lower threshold to 0.70 (70% similar) to get more articles
              if (similarity < 0.70) {
                continue; // Skip irrelevant articles
              }
            } catch (e) {
              // If embedding check fails, include the article anyway (better to include than miss)
            }
          }

          foundArticles.push({
            title: item.title,
            url: normalizedUrl,
            snippet: item.contentSnippet || item.content || "",
            publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
            source: matchingSource,
          });
        } catch (error) {
          console.error(`Error processing Google News item: ${item.title}`, error);
          continue;
        }
      }
    } catch (error) {
      console.error(`Error searching Google News with query "${searchQuery}":`, error);
      continue;
    }
  }

  console.log(`  Total unique articles found: ${foundArticles.length}`);
  return foundArticles;
}

/**
 * Get ALL articles from different political perspectives for a topic
 * Similar to Ground News - finds all articles, not just one per side
 */
async function getArticlesForTopic(topic: PoliticalTopic): Promise<{
  left: FoundArticle[];
  center: FoundArticle[];
  right: FoundArticle[];
}> {
  const articles = await searchGoogleNews(topic);
  
  // Group ALL articles by bias
  const leftArticles: FoundArticle[] = [];
  const centerArticles: FoundArticle[] = [];
  const rightArticles: FoundArticle[] = [];

  for (const article of articles) {
    const bias = article.source.bias_label;
    if (bias === "Left" || bias === "Center-Left") {
      leftArticles.push(article);
    } else if (bias === "Center") {
      centerArticles.push(article);
    } else if (bias === "Right" || bias === "Center-Right") {
      rightArticles.push(article);
    }
  }

  // Sort each group by authority score (best first)
  leftArticles.sort((a, b) => b.source.authority_score - a.source.authority_score);
  centerArticles.sort((a, b) => b.source.authority_score - a.source.authority_score);
  rightArticles.sort((a, b) => b.source.authority_score - a.source.authority_score);

  return {
    left: leftArticles,
    center: centerArticles,
    right: rightArticles,
  };
}

/**
 * Save article to database and classify bias
 */
async function saveArticle(article: FoundArticle, topicId: string, side: "Left" | "Center" | "Right") {
  const supabase = createAdminClient();
  
  try {
    // Check if article already exists
    const articleHash = hashString(article.title + new URL(article.url).hostname);
    const { data: existing } = await supabase
      .from("articles")
      .select("id")
      .eq("hash", articleHash)
      .single();

    let articleId: string;

    if (existing) {
      articleId = existing.id;
    } else {
      // Fetch full article content for better summary
      let summary = article.snippet;
      let fullContent = "";
      try {
        const response = await fetch(article.url, {
          headers: { "User-Agent": "MedianNews/1.0" },
          signal: AbortSignal.timeout(8000),
        });
        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);
          
          // Try to get meta description first
          const metaDesc = $('meta[property="og:description"]').attr("content") ||
                          $('meta[name="description"]').attr("content");
          if (metaDesc && metaDesc.length > 50) {
            summary = metaDesc;
          }
          
          // Extract article body for AI summary
          const articleBody = $('article').text() || 
                            $('.article-body').text() ||
                            $('.post-content').text() ||
                            $('.entry-content').text() ||
                            $('main').text() ||
                            $('body').text();
          
          if (articleBody && articleBody.length > 200) {
            fullContent = articleBody.substring(0, 3000); // Limit for API
          }
        }
      } catch (e) {
        // Use snippet if fetch fails
      }
      
      // Generate AI summary if we have content
      if (fullContent && fullContent.length > 200) {
        try {
          const aiSummary = await generateArticleSummary(article.title, fullContent, 300);
          if (aiSummary && aiSummary.length > 50) {
            summary = aiSummary;
          }
        } catch (e) {
          console.warn(`Failed to generate AI summary for "${article.title}":`, e);
          // Fall back to existing summary
        }
      }

      // Calculate reading time
      const readingTime = estimateReadingTime(fullContent || summary);
      
      // Insert article
      const { data: newArticle, error: articleError } = await supabase
        .from("articles")
        .insert({
          source_id: article.source.id,
          url: article.url,
          canonical_url: article.url,
          title: article.title,
          summary: summary.substring(0, 500),
          content_excerpt: (fullContent || summary).substring(0, 1000),
          published_at: article.publishedAt || new Date().toISOString(),
          lang: article.source.language || "en",
          hash: articleHash,
        })
        .select()
        .single();

      if (articleError || !newArticle) {
        throw new Error(`Failed to save article: ${articleError?.message}`);
      }

      articleId = newArticle.id;

      // Classify bias
      try {
        const biasResult = await classifyBias(
          article.title,
          summary,
          article.source.bias_label
        );

        await supabase.from("bias_scores").insert({
          article_id: articleId,
          leaning: biasResult.leaning,
          score: biasResult.score,
          confidence: biasResult.confidence,
          explanation: biasResult.explanation,
        });
      } catch (biasError) {
        // Fallback to source bias
        const sideLabel = article.source.bias_label === "Left" || article.source.bias_label === "Center-Left"
          ? "Left"
          : article.source.bias_label === "Right" || article.source.bias_label === "Center-Right"
          ? "Right"
          : "Center";

        await supabase.from("bias_scores").insert({
          article_id: articleId,
          leaning: sideLabel,
          score: sideLabel === "Center" ? 50 : sideLabel === "Left" ? 20 : 80,
          confidence: 60,
          explanation: `Based on source bias: ${article.source.bias_label}`,
        });
      }
    }

    // Add article to topic
    await supabase.from("topic_members").upsert({
      topic_id: topicId,
      article_id: articleId,
      side_label: side,
    }, {
      onConflict: "topic_id,article_id"
    });

    return articleId;
  } catch (error) {
    console.error(`Error saving article "${article.title}":`, error);
    throw error;
  }
}

/**
 * Discover topics and find articles for each
 */
export async function discoverAndSaveTopics() {
  const supabase = createAdminClient();
  
  // Step 1: Discover topics using AI
  console.log("Discovering political topics...");
  const topics = await discoverPoliticalTopics();
  console.log(`Found ${topics.length} topics`);

  let topicsCreated = 0;
  let articlesFound = 0;
  let errors = 0;

  // Step 2: For each topic, search Google News and find articles
  for (const topic of topics) {
    try {
      console.log(`\nProcessing topic: "${topic.title}"`);
      
      // Get ALL articles from different perspectives
      const articles = await getArticlesForTopic(topic);
      
      // Count how many perspectives we have (need at least 1 article from each)
      const hasLeft = articles.left.length > 0;
      const hasCenter = articles.center.length > 0;
      const hasRight = articles.right.length > 0;
      const perspectiveCount = [hasLeft, hasCenter, hasRight].filter(Boolean).length;

      // Only create topic if we have at least 2 different perspectives
      if (perspectiveCount < 2) {
        console.log(`  Skipping: Only found ${perspectiveCount} perspective(s) (need at least 2)`);
        console.log(`    Left: ${articles.left.length}, Center: ${articles.center.length}, Right: ${articles.right.length}`);
        continue;
      }

      const totalArticles = articles.left.length + articles.center.length + articles.right.length;
      console.log(`  Found ${totalArticles} articles across ${perspectiveCount} perspectives:`);
      console.log(`    Left: ${articles.left.length}, Center: ${articles.center.length}, Right: ${articles.right.length}`);

      // Create topic
      const { data: newTopic, error: topicError } = await supabase
        .from("topics")
        .insert({
          title: topic.title,
          cluster_hash: hashString(topic.title.toLowerCase()),
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (topicError || !newTopic) {
        console.error(`  Error creating topic: ${topicError?.message}`);
        errors++;
        continue;
      }

      topicsCreated++;

      // Save ALL articles from each perspective
      for (const article of articles.left) {
        try {
          await saveArticle(article, newTopic.id, "Left");
          articlesFound++;
          console.log(`  ✓ Saved Left: "${article.title}" (${article.source.name})`);
        } catch (e) {
          console.error(`  ✗ Error saving Left article:`, e);
          errors++;
        }
      }

      for (const article of articles.center) {
        try {
          await saveArticle(article, newTopic.id, "Center");
          articlesFound++;
          console.log(`  ✓ Saved Center: "${article.title}" (${article.source.name})`);
        } catch (e) {
          console.error(`  ✗ Error saving Center article:`, e);
          errors++;
        }
      }

      for (const article of articles.right) {
        try {
          await saveArticle(article, newTopic.id, "Right");
          articlesFound++;
          console.log(`  ✓ Saved Right: "${article.title}" (${article.source.name})`);
        } catch (e) {
          console.error(`  ✗ Error saving Right article:`, e);
          errors++;
        }
      }

    } catch (error) {
      console.error(`Error processing topic "${topic.title}":`, error);
      errors++;
    }
  }

  return {
    topicsDiscovered: topics.length,
    topicsCreated,
    articlesFound,
    errors,
  };
}

