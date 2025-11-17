import { createClient } from "@/lib/supabase/server";
import { TopicFeedItem } from "@/components/topic-feed-item";
import { Card } from "@/components/ui/card";

async function getLocalTopics() {
  const supabase = await createClient();
  
  // For now, return same as homepage - can be filtered by location later
  const { data: homepageTopics } = await supabase
    .from("homepage_topics")
    .select(`
      topic_id,
      title,
      first_seen_at,
      last_seen_at
    `)
    .order("importance_score", { ascending: false })
    .limit(30);

  if (!homepageTopics) return [];

  // Get article counts
  const topicIds = homepageTopics.map(t => t.topic_id);
  const { data: members } = await supabase
    .from("topic_members")
    .select(`
      topic_id,
      side_label,
      articles!inner(sources!inner(id))
    `)
    .in("topic_id", topicIds);

  const topicStats = new Map<string, { left: number; center: number; right: number; sources: Set<string> }>();
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

  return homepageTopics.map((topic: any) => {
    const stats = topicStats.get(topic.topic_id) || { left: 0, center: 0, right: 0, sources: new Set() };
    return {
      topic_id: topic.topic_id,
      title: topic.title,
      published_at: topic.first_seen_at || new Date().toISOString(),
      updated_at: topic.last_seen_at,
      leftCount: stats.left,
      centerCount: stats.center,
      rightCount: stats.right,
      totalSources: stats.sources.size,
      hasIncompleteCoverage: stats.left === 0 || stats.center === 0 || stats.right === 0,
    };
  });
}

export default async function LocalPage() {
  const topics = await getLocalTopics();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-gray-100 mb-2">Local News</h1>
          <p className="text-gray-600 dark:text-gray-400">News stories relevant to your location</p>
        </div>

        {topics.length === 0 ? (
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No local topics found. Set your location to see local news.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <TopicFeedItem
                key={topic.topic_id}
                topicId={topic.topic_id}
                title={topic.title}
                publishedAt={topic.published_at}
                updatedAt={topic.updated_at}
                leftCount={topic.leftCount}
                centerCount={topic.centerCount}
                rightCount={topic.rightCount}
                totalSources={topic.totalSources}
                hasIncompleteCoverage={topic.hasIncompleteCoverage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

