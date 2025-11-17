import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CategoryFilter } from "@/components/category-filter";
import { EnhancedFeatures } from "@/components/enhanced-features";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

async function getTopClusters() {
  const supabase = await createClient();
  
  // Get topics from homepage_topics table (updated daily by cron)
  const { data: homepageTopics, error } = await supabase
    .from("homepage_topics")
    .select(`
      topic_id,
      title,
      left_article_id,
      center_article_id,
      right_article_id,
      blindspot_side,
      importance_score,
      built_at,
      topics!inner(
        first_seen_at,
        last_seen_at
      )
    `)
    .order("importance_score", { ascending: false })
    .limit(30);
  
  if (error || !homepageTopics) {
    console.error("Error fetching homepage topics:", error);
    return { topics: [], allUniqueSources: new Set<string>() };
  }

  if (homepageTopics.length === 0) {
    return { topics: [], allUniqueSources: new Set<string>() };
  }

  // Fetch article details separately with source info
  const articleIds = new Set<string>();
  homepageTopics.forEach(topic => {
    if (topic.left_article_id) articleIds.add(topic.left_article_id);
    if (topic.center_article_id) articleIds.add(topic.center_article_id);
    if (topic.right_article_id) articleIds.add(topic.right_article_id);
  });

  let articlesMap = new Map();
  if (articleIds.size > 0) {
    const { data: articles } = await supabase
      .from("articles")
      .select(`
        id,
        title,
        url,
        summary,
        published_at,
        sources!inner(name)
      `)
      .in("id", Array.from(articleIds));

    articlesMap = new Map((articles || []).map(a => [a.id, a]));
  }

  // Get source counts per topic
  const topicIds = homepageTopics.map(t => t.topic_id);
  let topicMembers = null;
  if (topicIds.length > 0) {
    const { data } = await supabase
      .from("topic_members")
      .select(`
        topic_id,
        side_label,
        articles!inner(
          id,
          sources!inner(id, name)
        )
      `)
      .in("topic_id", topicIds);
    topicMembers = data;
  }

  // Count unique sources per topic
  const sourceCountsMap = new Map<string, Set<string>>();
  if (topicMembers) {
    topicMembers.forEach((member: any) => {
      const topicId = member.topic_id;
      if (!sourceCountsMap.has(topicId)) {
        sourceCountsMap.set(topicId, new Set());
      }
      const sources = sourceCountsMap.get(topicId)!;
      if (member.articles?.sources?.id) {
        sources.add(member.articles.sources.id);
      }
    });
  }
  // Convert Sets to counts
  const sourceCounts = new Map<string, number>();
  sourceCountsMap.forEach((set, topicId) => {
    sourceCounts.set(topicId, set.size);
  });

  // Get article counts per perspective for each topic and collect all source names
  const topicStats = new Map<string, { left: number; center: number; right: number }>();
  const allUniqueSources = new Set<string>();
  
  if (topicMembers) {
    topicMembers.forEach((member: any) => {
      const topicId = member.topic_id;
      if (!topicStats.has(topicId)) {
        topicStats.set(topicId, { left: 0, center: 0, right: 0 });
      }
      const stats = topicStats.get(topicId)!;
      if (member.side_label === "Left") stats.left++;
      else if (member.side_label === "Center") stats.center++;
      else if (member.side_label === "Right") stats.right++;
      
      // Collect source names
      if (member.articles?.sources?.name) {
        allUniqueSources.add(member.articles.sources.name);
      }
    });
  }

  // Transform to feed format
  const topics = homepageTopics.map((topic: any) => {
    const stats = topicStats.get(topic.topic_id) || { left: 0, center: 0, right: 0 };
    const sourceCount = sourceCounts.get(topic.topic_id) || 0;
    const hasIncomplete = !topic.left_article_id || !topic.center_article_id || !topic.right_article_id;
    
    // Get dates from topics relation
    const topicData = Array.isArray(topic.topics) ? topic.topics[0] : topic.topics;
    const publishedAt = topicData?.first_seen_at || topic.built_at || new Date().toISOString();
    const updatedAt = topicData?.last_seen_at || topic.built_at || new Date().toISOString();

    return {
      topic_id: topic.topic_id,
      title: topic.title,
      published_at: publishedAt,
      updated_at: updatedAt,
      leftCount: stats.left,
      centerCount: stats.center,
      rightCount: stats.right,
      totalSources: sourceCount,
      hasIncompleteCoverage: hasIncomplete,
      importanceScore: topic.importance_score || 0,
    };
  });

  return { topics, allUniqueSources };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { topics, allUniqueSources } = await getTopClusters();
  const { category } = await (searchParams || Promise.resolve({}));

  // Filter topics by category if selected
  let filteredTopics = topics;
  if (category && category !== "All") {
    // Simple keyword matching - can be enhanced with AI categorization
    filteredTopics = topics.filter(topic =>
      topic.title.toLowerCase().includes(category.toLowerCase())
    );
  }

  const totalArticles = filteredTopics.reduce((sum, t) => sum + t.leftCount + t.centerCount + t.rightCount, 0);
  const incompleteTopics = filteredTopics.filter(t => t.hasIncompleteCoverage);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Main Content - News Website Style */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {/* Enhanced Features Stats */}
        {filteredTopics.length > 0 && (
          <EnhancedFeatures
            totalSources={allUniqueSources.size}
            totalArticles={totalArticles}
            lastUpdated={filteredTopics[0]?.updated_at ? formatDistanceToNow(new Date(filteredTopics[0].updated_at), { addSuffix: true }) : undefined}
            trending={true}
          />
        )}

        {/* Breaking News Banner (if needed) */}
        {filteredTopics.length > 0 && (
          <div className="mb-6 border-l-4 border-[#DC2626] bg-red-50 dark:bg-red-900/20 pl-4 py-2">
            <div className="flex items-center gap-2">
              <span className="news-byline text-[#DC2626] font-bold">BREAKING</span>
              <span className="text-sm text-gray-900 dark:text-gray-100 font-medium line-clamp-1">
                {filteredTopics[0]?.title}
              </span>
            </div>
          </div>
        )}

        {/* Main Headline Section */}
        {filteredTopics.length > 0 && (
          <div className="mb-8 pb-8 border-b-2 border-gray-300 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Featured Story - Large */}
              <div className="lg:col-span-2">
                <Link href={`/topic/${filteredTopics[0].topic_id}`} className="block group">
                  <div className="mb-3">
                    <span className="news-byline text-[#DC2626]">TOP STORY</span>
                  </div>
                  <h1 className="news-headline text-4xl lg:text-5xl text-gray-900 dark:text-gray-100 mb-4 group-hover:text-[#DC2626] transition-colors leading-tight">
                    {filteredTopics[0].title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>{filteredTopics[0].totalSources} sources</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(filteredTopics[0].published_at), { addSuffix: true })}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#3366FF]"></span>
                      <span>L {filteredTopics[0].leftCount}</span>
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span>C {filteredTopics[0].centerCount}</span>
                      <span className="w-2 h-2 rounded-full bg-[#FF3B3B]"></span>
                      <span>R {filteredTopics[0].rightCount}</span>
                    </span>
                  </div>
                </Link>
              </div>

              {/* Side Stories */}
              <div className="space-y-6 border-l border-gray-200 dark:border-gray-700 pl-6">
                <div className="news-byline text-gray-500 dark:text-gray-400 mb-4">MORE STORIES</div>
                {filteredTopics.slice(1, 4).map((topic) => (
                  <Link key={topic.topic_id} href={`/topic/${topic.topic_id}`} className="block group">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-[#DC2626] transition-colors line-clamp-2 leading-snug">
                      {topic.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{topic.totalSources} sources</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(topic.published_at), { addSuffix: true })}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Topic Categories - News Style */}
        <CategoryFilter />

        {/* News Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main News Feed */}
          <div className="lg:col-span-8 space-y-6">
            {filteredTopics.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <p className="text-xl text-gray-700 dark:text-gray-300 font-medium mb-2">No stories found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {category ? `No stories found in "${category}" category.` : "Stories are generated automatically as news articles are ingested. Check back soon!"}
                </p>
              </div>
            ) : (
              <>
                {/* Section Header */}
                <div className="border-b-2 border-gray-300 dark:border-gray-700 pb-2">
                  <h2 className="news-headline text-2xl text-gray-900 dark:text-gray-100">
                    {category && category !== "All" ? `${category} News` : "Latest News"}
                  </h2>
                </div>

                {/* News Articles */}
                {filteredTopics.slice(1).map((topic, idx) => (
                  <article key={topic.topic_id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                    <Link href={`/topic/${topic.topic_id}`} className="block group">
                      <div className="flex items-start gap-4">
                        {/* Article Number (News Style) */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400">
                          {idx + 2}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-[#DC2626] transition-colors leading-tight">
                            {topic.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <span className="font-semibold">{topic.totalSources} sources covering this story</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(topic.published_at), { addSuffix: true })}</span>
                          </div>
                          
                          {/* Coverage Preview */}
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-[#3366FF]">Left: {topic.leftCount}</span>
                              <span className="text-xs font-semibold text-gray-600">Center: {topic.centerCount}</span>
                              <span className="text-xs font-semibold text-[#FF3B3B]">Right: {topic.rightCount}</span>
                            </div>
                            {topic.hasIncompleteCoverage && (
                              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                Incomplete Coverage
                              </span>
                            )}
                          </div>
                          
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden flex max-w-md">
                            {topic.leftCount > 0 && (
                              <div
                                className="bg-[#3366FF]"
                                style={{ width: `${((topic.leftCount / (topic.leftCount + topic.centerCount + topic.rightCount)) * 100)}%` }}
                              />
                            )}
                            {topic.centerCount > 0 && (
                              <div
                                className="bg-gray-400"
                                style={{ width: `${((topic.centerCount / (topic.leftCount + topic.centerCount + topic.rightCount)) * 100)}%` }}
                              />
                            )}
                            {topic.rightCount > 0 && (
                              <div
                                className="bg-[#FF3B3B]"
                                style={{ width: `${((topic.rightCount / (topic.leftCount + topic.centerCount + topic.rightCount)) * 100)}%` }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </>
            )}
          </div>

          {/* Sidebar - News Style */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Today's Stats */}
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="news-headline text-xl text-gray-900 dark:text-gray-100 mb-4 pb-3 border-b border-gray-300 dark:border-gray-700">Today's News</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Stories</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredTopics.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Articles</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalArticles}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Sources</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{allUniqueSources.size}</span>
                </div>
              </div>
            </div>

            {/* Incomplete Coverage - News Alert Style */}
            {incompleteTopics.length > 0 && (
              <div className="border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="news-headline text-lg text-gray-900 dark:text-gray-100">Coverage Gaps</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  Stories missing coverage from one or more political perspectives.
                </p>
                <div className="space-y-3">
                  {incompleteTopics.slice(0, 4).map((topic) => (
                    <Link
                      key={topic.topic_id}
                      href={`/topic/${topic.topic_id}`}
                      className="block p-3 bg-white dark:bg-gray-800 rounded border border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-sm transition-all group"
                    >
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-[#DC2626] transition-colors">
                        {topic.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">{topic.totalSources} sources</span>
                        <span>•</span>
                        <span className="text-amber-700 font-semibold">Missing perspectives</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Topics */}
            <div className="border-t-2 border-gray-300 dark:border-gray-700 pt-6">
              <h3 className="news-headline text-xl text-gray-900 dark:text-gray-100 mb-4">Trending</h3>
              <div className="space-y-4">
                {filteredTopics.slice(0, 5).map((topic, idx) => (
                  <Link
                    key={topic.topic_id}
                    href={`/topic/${topic.topic_id}`}
                    className="block group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 text-2xl font-bold text-gray-300 dark:text-gray-600 group-hover:text-[#DC2626] transition-colors">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-[#DC2626] transition-colors leading-snug">
                          {topic.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{topic.totalSources} sources</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}



