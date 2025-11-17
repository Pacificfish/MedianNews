"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, TrendingUp } from "lucide-react";

interface TopicFeedItemProps {
  topicId: string;
  title: string;
  publishedAt: string;
  updatedAt?: string;
  leftCount: number;
  centerCount: number;
  rightCount: number;
  totalSources: number;
  country?: string;
  hasIncompleteCoverage?: boolean;
}

export function TopicFeedItem({
  topicId,
  title,
  publishedAt,
  updatedAt,
  leftCount,
  centerCount,
  rightCount,
  totalSources,
  country = "United States",
  hasIncompleteCoverage = false,
}: TopicFeedItemProps) {
  const totalArticles = leftCount + centerCount + rightCount;
  const leftPercent = totalArticles > 0 ? Math.round((leftCount / totalArticles) * 100) : 0;
  const centerPercent = totalArticles > 0 ? Math.round((centerCount / totalArticles) * 100) : 0;
  const rightPercent = totalArticles > 0 ? Math.round((rightCount / totalArticles) * 100) : 0;

  return (
    <article className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors p-4 -mx-4 rounded">
      <Link href={`/topic/${topicId}`} className="block group">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-[#DC2626] transition-colors leading-tight">
              {title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <span className="font-semibold">{totalSources} sources</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}</span>
              {updatedAt && (
                <>
                  <span>•</span>
                  <span>Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}</span>
                </>
              )}
            </div>
            
            {/* Coverage Stats - News Style */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-[#3366FF]">Left: {leftCount}</span>
                <span className="font-semibold text-gray-600">Center: {centerCount}</span>
                <span className="font-semibold text-[#FF3B3B]">Right: {rightCount}</span>
              </div>
              {hasIncompleteCoverage && (
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                  Incomplete
                </span>
              )}
            </div>
            
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex max-w-md">
              {leftPercent > 0 && (
                <div
                  className="bg-[#3366FF]"
                  style={{ width: `${leftPercent}%` }}
                />
              )}
              {centerPercent > 0 && (
                <div
                  className="bg-gray-400"
                  style={{ width: `${centerPercent}%` }}
                />
              )}
              {rightPercent > 0 && (
                <div
                  className="bg-[#FF3B3B]"
                  style={{ width: `${rightPercent}%` }}
                />
              )}
            </div>
          </div>
          <ExternalLink className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1 group-hover:text-[#DC2626] transition-colors" />
        </div>
      </Link>
    </article>
  );
}

