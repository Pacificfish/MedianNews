import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const supabase = await createClient();
  const { data: topics } = await supabase
    .from("topics")
    .select("id, last_seen_at")
    .order("last_seen_at", { ascending: false })
    .limit(1000);

  const topicUrls = (topics || []).map((topic) => ({
    url: `${baseUrl}/topic/${topic.id}`,
    lastModified: new Date(topic.last_seen_at),
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${baseUrl}/analyze`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...topicUrls,
  ];
}



