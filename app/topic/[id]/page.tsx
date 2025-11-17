import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CommentsSection } from "@/components/comments-section";
import { CoverageStats } from "@/components/coverage-stats";
import { ArticleList } from "@/components/article-list";
import { ArticleSummary } from "@/components/article-summary";
import { SocialShare } from "@/components/social-share";
import { ComparePerspectives } from "@/components/compare-perspectives";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getTopic(id: string) {
  const supabase = await createClient();

  const { data: topic, error } = await supabase
    .from("topics")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !topic) {
    console.error("Error fetching topic:", error);
    return null;
  }

  // Get ALL articles for this topic, grouped by side
  const { data: members, error: membersError } = await supabase
    .from("topic_members")
    .select(`
      side_label,
      articles!inner(
        id,
        title,
        url,
        summary,
        published_at,
        sources!inner(name),
        bias_scores(leaning, score, confidence)
      )
    `)
    .eq("topic_id", id)
    .order("published_at", { ascending: false, foreignTable: "articles" });

  if (membersError) {
    console.error("Error fetching topic members:", membersError);
  }

  if (!members || members.length === 0) {
    return {
      topic,
      articles: { left: [], center: [], right: [] },
      stats: { totalSources: 0, leftCount: 0, centerCount: 0, rightCount: 0 },
    };
  }

  // Group articles by side
  const leftArticles = members
    .filter((m) => m.side_label === "Left")
    .map((m) => ({
      id: m.articles.id,
      title: m.articles.title,
      url: m.articles.url,
      source: m.articles.sources.name,
      summary: m.articles.summary,
      bias: (m.articles.bias_scores?.[0]?.leaning || "Left") as "Left" | "Center" | "Right",
      score: m.articles.bias_scores?.[0]?.score || 20,
      confidence: m.articles.bias_scores?.[0]?.confidence || 70,
      publishedAt: m.articles.published_at,
    }));

  const centerArticles = members
    .filter((m) => m.side_label === "Center")
    .map((m) => ({
      id: m.articles.id,
      title: m.articles.title,
      url: m.articles.url,
      source: m.articles.sources.name,
      summary: m.articles.summary,
      bias: (m.articles.bias_scores?.[0]?.leaning || "Center") as "Left" | "Center" | "Right",
      score: m.articles.bias_scores?.[0]?.score || 50,
      confidence: m.articles.bias_scores?.[0]?.confidence || 70,
      publishedAt: m.articles.published_at,
    }));

  const rightArticles = members
    .filter((m) => m.side_label === "Right")
    .map((m) => ({
      id: m.articles.id,
      title: m.articles.title,
      url: m.articles.url,
      source: m.articles.sources.name,
      summary: m.articles.summary,
      bias: (m.articles.bias_scores?.[0]?.leaning || "Right") as "Left" | "Center" | "Right",
      score: m.articles.bias_scores?.[0]?.score || 80,
      confidence: m.articles.bias_scores?.[0]?.confidence || 70,
      publishedAt: m.articles.published_at,
    }));

  // Count unique sources and get source names
  const uniqueSources = new Set(
    members.map((m) => m.articles.sources.name)
  );
  const sourceNames = Array.from(uniqueSources);

  return {
    topic,
    articles: {
      left: leftArticles,
      center: centerArticles,
      right: rightArticles,
    },
    stats: {
      totalSources: uniqueSources.size,
      leftCount: leftArticles.length,
      centerCount: centerArticles.length,
      rightCount: rightArticles.length,
      sourceNames,
    },
  };
}

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { id } = await params;
  const { view } = await (searchParams || Promise.resolve({}));
  const data = await getTopic(id);

  if (!data) {
    console.error("Topic page: Topic not found for ID:", id);
    notFound();
  }

  const totalArticles = data.articles.left.length + data.articles.center.length + data.articles.right.length;
  const lastUpdated = data.topic.last_seen_at
    ? formatDistanceToNow(new Date(data.topic.last_seen_at), { addSuffix: true })
    : undefined;

  // Get representative articles for summary
  const representativeArticles = [
    ...data.articles.left.slice(0, 1),
    ...data.articles.center.slice(0, 1),
    ...data.articles.right.slice(0, 1),
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header - News Article Style */}
        <header className="mb-8 pb-6 border-b-2 border-gray-300 dark:border-gray-700">
          <div className="mb-3">
            <span className="news-byline text-[#DC2626]">POLITICAL NEWS</span>
          </div>
          <h1 className="news-headline text-4xl sm:text-5xl lg:text-6xl text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            {data.topic.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span className="font-semibold">By Median News Staff</span>
            <span>•</span>
            <span>{data.topic.first_seen_at ? formatDistanceToNow(new Date(data.topic.first_seen_at), { addSuffix: true }) : "recently"}</span>
            {lastUpdated && (
              <>
                <span>•</span>
                <span>Updated {lastUpdated}</span>
              </>
            )}
          </div>

          {/* Social Sharing */}
          <div className="mb-6">
            <SocialShare
              url={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/topic/${id}`}
              title={data.topic.title}
              topicId={id}
            />
          </div>

          {/* Perspective Buttons */}
          <div className="flex items-center gap-3 mb-6">
            {data.articles.left.length > 0 && (
              <Link href={`/topic/${id}?view=left`}>
                <Button
                  variant={data.articles.left.length > 0 ? "default" : "outline"}
                  className={data.articles.left.length > 0 ? "bg-[#3366FF] hover:bg-[#2952CC] text-white" : ""}
                >
                  Left ({data.articles.left.length})
                </Button>
              </Link>
            )}
            {data.articles.center.length > 0 && (
              <Link href={`/topic/${id}?view=center`}>
                <Button
                  variant={data.articles.center.length > 0 ? "default" : "outline"}
                  className={data.articles.center.length > 0 ? "bg-gray-600 hover:bg-gray-700 text-white" : ""}
                >
                  Center ({data.articles.center.length})
                </Button>
              </Link>
            )}
            {data.articles.right.length > 0 && (
              <Link href={`/topic/${id}?view=right`}>
                <Button
                  variant={data.articles.right.length > 0 ? "default" : "outline"}
                  className={data.articles.right.length > 0 ? "bg-[#FF3B3B] hover:bg-[#E02E2E] text-white" : ""}
                >
                  Right ({data.articles.right.length})
                </Button>
              </Link>
            )}
            <a href="#compare">
              <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                Compare Perspectives
              </Button>
            </a>
          </div>

          {/* Article Summary */}
          {representativeArticles.length > 0 && (
            <ArticleSummary articles={representativeArticles} />
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - Articles */}
          <div className="lg:col-span-8 space-y-8">
            {/* Coverage Stats Summary */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-800/50 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Total Coverage</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {totalArticles} article{totalArticles !== 1 ? "s" : ""} from {data.stats.totalSources} source{data.stats.totalSources !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                  {data.stats.leftCount > 0 && (
                    <div
                      className="bg-[#3366FF] transition-all"
                      style={{ width: `${(data.stats.leftCount / totalArticles) * 100}%` }}
                    />
                  )}
                  {data.stats.centerCount > 0 && (
                    <div
                      className="bg-gray-400 transition-all"
                      style={{ width: `${(data.stats.centerCount / totalArticles) * 100}%` }}
                    />
                  )}
                  {data.stats.rightCount > 0 && (
                    <div
                      className="bg-[#FF3B3B] transition-all"
                      style={{ width: `${(data.stats.rightCount / totalArticles) * 100}%` }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Articles by Perspective - Tabs */}
            <Tabs defaultValue={view || "all"} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({totalArticles})</TabsTrigger>
                <TabsTrigger value="left">Left ({data.articles.left.length})</TabsTrigger>
                <TabsTrigger value="center">Center ({data.articles.center.length})</TabsTrigger>
                <TabsTrigger value="right">Right ({data.articles.right.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6 mt-6">
                {data.articles.left.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-[#3366FF] mb-4 pb-2 border-b-2 border-[#3366FF]">
                      Left Perspective ({data.articles.left.length})
                    </h3>
                    <ArticleList articles={data.articles.left} perspective="Left" />
                  </div>
                )}
                {data.articles.center.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b-2 border-gray-400 dark:border-gray-600">
                      Center Perspective ({data.articles.center.length})
                    </h3>
                    <ArticleList articles={data.articles.center} perspective="Center" />
                  </div>
                )}
                {data.articles.right.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-[#FF3B3B] mb-4 pb-2 border-b-2 border-[#FF3B3B]">
                      Right Perspective ({data.articles.right.length})
                    </h3>
                    <ArticleList articles={data.articles.right} perspective="Right" />
                  </div>
                )}
                {totalArticles === 0 && (
                  <Card className="dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No articles found for this topic.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="left" className="mt-6">
                <ArticleList articles={data.articles.left} perspective="Left" />
              </TabsContent>

              <TabsContent value="center" className="mt-6">
                <ArticleList articles={data.articles.center} perspective="Center" />
              </TabsContent>

              <TabsContent value="right" className="mt-6">
                <ArticleList articles={data.articles.right} perspective="Right" />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Stats */}
          <div className="lg:col-span-4 space-y-6">
            <CoverageStats
              totalSources={data.stats.totalSources}
              leftCount={data.stats.leftCount}
              centerCount={data.stats.centerCount}
              rightCount={data.stats.rightCount}
              lastUpdated={lastUpdated}
              sourceNames={data.stats.sourceNames}
            />

            {/* Missing Coverage Alert */}
            {(data.stats.leftCount === 0 || data.stats.centerCount === 0 || data.stats.rightCount === 0) && (
              <Card className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-amber-900 dark:text-amber-200">
                    Incomplete Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    This story is missing coverage from:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-300">
                    {data.stats.leftCount === 0 && <li>• Left-leaning sources</li>}
                    {data.stats.centerCount === 0 && <li>• Center sources</li>}
                    {data.stats.rightCount === 0 && <li>• Right-leaning sources</li>}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Compare Perspectives Section */}
        {(data.articles.left.length > 0 || data.articles.center.length > 0 || data.articles.right.length > 0) && (
          <ComparePerspectives
            leftArticles={data.articles.left.map(a => ({
              id: a.id,
              title: a.title,
              url: a.url,
              source: a.source,
              summary: a.summary,
              publishedAt: a.publishedAt,
              bias: a.bias,
              score: a.score,
              confidence: a.confidence,
            }))}
            centerArticles={data.articles.center.map(a => ({
              id: a.id,
              title: a.title,
              url: a.url,
              source: a.source,
              summary: a.summary,
              publishedAt: a.publishedAt,
              bias: a.bias,
              score: a.score,
              confidence: a.confidence,
            }))}
            rightArticles={data.articles.right.map(a => ({
              id: a.id,
              title: a.title,
              url: a.url,
              source: a.source,
              summary: a.summary,
              publishedAt: a.publishedAt,
              bias: a.bias,
              score: a.score,
              confidence: a.confidence,
            }))}
          />
        )}

        {/* Comments Section */}
        <div className="mt-12">
          <CommentsSection topicId={id} />
        </div>
      </div>
    </div>
  );
}



