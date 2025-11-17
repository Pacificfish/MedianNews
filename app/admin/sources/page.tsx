import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SourcesTable } from "@/components/admin/sources-table";

export default async function AdminSourcesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TODO: Check admin role
  if (!user) {
    redirect("/login");
  }

  const { data: sources } = await supabase
    .from("sources")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">News Sources</h1>
        <p className="text-gray-600">Manage RSS sources for ingestion</p>
      </div>

      <SourcesTable sources={sources || []} />
    </div>
  );
}



