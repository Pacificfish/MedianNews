import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminMonitorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TODO: Check admin role
  if (!user) {
    redirect("/login");
  }

  // Get recent ingestion stats (simplified - in production, log to a separate table)
  const { data: recentArticles } = await supabase
    .from("articles")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: topics } = await supabase
    .from("topics")
    .select("id")
    .limit(1000);

  const { data: sources } = await supabase
    .from("sources")
    .select("id, active")
    .limit(1000);

  const activeSources = sources?.filter((s) => s.active).length || 0;
  const totalSources = sources?.length || 0;

  // Calculate articles in last hour
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  const recentCount = recentArticles?.filter(
    (a) => new Date(a.created_at) >= oneHourAgo
  ).length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">System Monitor</h1>
        <p className="text-gray-600">Ingestion and system health metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeSources}</div>
            <div className="text-sm text-gray-500">of {totalSources} total</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Articles (Last Hour)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recentCount}</div>
            <div className="text-sm text-gray-500">ingested</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topic Clusters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{topics?.length || 0}</div>
            <div className="text-sm text-gray-500">active topics</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Last ingestion run: {recentArticles?.[0]?.created_at 
              ? new Date(recentArticles[0].created_at).toLocaleString()
              : "Never"}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Note: Full monitoring requires logging ingestion runs to a separate table.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



