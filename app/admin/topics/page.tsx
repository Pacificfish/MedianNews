import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export default async function AdminTopicsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TODO: Check admin role
  if (!user) {
    redirect("/login");
  }

  const { data: topics } = await supabase
    .from("topics")
    .select(`
      id,
      title,
      first_seen_at,
      last_seen_at,
      topic_members!inner(
        side_label,
        articles!inner(id)
      )
    `)
    .order("last_seen_at", { ascending: false })
    .limit(100);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Topic Clusters</h1>
        <p className="text-gray-600">Inspect and manage topic clusters</p>
      </div>

      <div className="space-y-4">
        {topics?.map((topic: any) => {
          const members = topic.topic_members || [];
          const leftCount = members.filter((m: any) => m.side_label === "Left").length;
          const centerCount = members.filter((m: any) => m.side_label === "Center").length;
          const rightCount = members.filter((m: any) => m.side_label === "Right").length;
          const totalCount = members.length;
          const hasAllSides = leftCount > 0 && centerCount > 0 && rightCount > 0;

          return (
            <Card key={topic.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-heading font-semibold mb-2">
                      {topic.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>
                        First seen: {formatDistanceToNow(new Date(topic.first_seen_at), { addSuffix: true })}
                      </span>
                      <span>
                        Last updated: {formatDistanceToNow(new Date(topic.last_seen_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                          Left: {leftCount}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
                          Center: {centerCount}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">
                          Right: {rightCount}
                        </span>
                        <span className="text-xs text-gray-500">
                          Total: {totalCount}
                        </span>
                      </div>
                      {!hasAllSides && (
                        <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">
                          Blindspot
                        </span>
                      )}
                    </div>
                  </div>
                  <Link href={`/topic/${topic.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}



