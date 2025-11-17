"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopicFeedItem } from "@/components/topic-feed-item";
import { Card } from "@/components/ui/card";
import { Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface SavedTopic {
  topic_id: string;
  title: string;
  published_at: string;
  updated_at: string;
  leftCount: number;
  centerCount: number;
  rightCount: number;
  totalSources: number;
  hasIncompleteCoverage: boolean;
}

export default function SavedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [topics, setTopics] = useState<SavedTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push("/login?redirect=/saved");
        return;
      }

      setUser(user);

      // Fetch saved topics
      const { data: savedTopics, error: savedError } = await supabase
        .from("saved_topics")
        .select(`
          topic_id,
          created_at,
          topics!inner(
            id,
            title,
            first_seen_at,
            last_seen_at
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (savedError) {
        console.error("Error fetching saved topics:", savedError);
        setLoading(false);
        return;
      }

      if (!savedTopics || savedTopics.length === 0) {
        setTopics([]);
        setLoading(false);
        return;
      }

      const topicIds = savedTopics.map(st => st.topic_id);
      const { data: members, error: membersError } = await supabase
        .from("topic_members")
        .select(`
          topic_id,
          side_label,
          articles!inner(sources!inner(id))
        `)
        .in("topic_id", topicIds);

      if (membersError) {
        console.error("Error fetching topic members:", membersError);
        setTopics([]);
        setLoading(false);
        return;
      }

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

      const formattedTopics = savedTopics.map((st: any) => {
        const stats = topicStats.get(st.topic_id) || { left: 0, center: 0, right: 0, sources: new Set() };
        return {
          topic_id: st.topic_id,
          title: st.topics.title,
          published_at: st.topics.first_seen_at || new Date().toISOString(),
          updated_at: st.topics.last_seen_at,
          leftCount: stats.left,
          centerCount: stats.center,
          rightCount: stats.right,
          totalSources: stats.sources.size,
          hasIncompleteCoverage: stats.left === 0 || stats.center === 0 || stats.right === 0,
        };
      });

      setTopics(formattedTopics);
      setLoading(false);
    };

    loadData();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3366FF] mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading saved topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="h-8 w-8 text-[#3366FF] dark:text-[#3366FF]" />
            <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-gray-100">Saved Topics</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Your bookmarked news stories</p>
        </div>

        {topics.length === 0 ? (
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <div className="p-12 text-center">
              <Bookmark className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No saved topics yet. Save topics to view them here.</p>
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
