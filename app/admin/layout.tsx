import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <Link href="/admin/sources">
              <Button variant="ghost">Sources</Button>
            </Link>
            <Link href="/admin/topics">
              <Button variant="ghost">Topics</Button>
            </Link>
            <Link href="/admin/monitor">
              <Button variant="ghost">Monitor</Button>
            </Link>
            <Link href="/admin/ingest">
              <Button variant="ghost">Run Ingestion</Button>
            </Link>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}



