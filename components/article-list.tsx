"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArticleClickTracker } from "@/components/article-click-tracker";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import { SideLabel } from "@/types";

interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  summary?: string;
  publishedAt?: string;
  bias: SideLabel;
  score: number;
  confidence: number;
}

interface ArticleListProps {
  articles: Article[];
  perspective: "Left" | "Center" | "Right";
  emptyMessage?: string;
}

// Get source logo/icon (simplified - can be enhanced with actual logos)
function getSourceInitials(source: string): string {
  return source
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function ArticleList({ articles, perspective, emptyMessage }: ArticleListProps) {
  const colorMap = {
    Left: {
      border: "border-[#3366FF]",
      bg: "bg-blue-50/30 dark:bg-blue-900/20",
      text: "text-[#3366FF]",
      hover: "hover:bg-blue-50 dark:hover:bg-blue-900/30",
      badge: "bg-[#3366FF]/10 dark:bg-[#3366FF]/20 text-[#3366FF] border-[#3366FF]/30",
    },
    Center: {
      border: "border-gray-400 dark:border-gray-600",
      bg: "bg-gray-50/30 dark:bg-gray-800/50",
      text: "text-gray-700 dark:text-gray-300",
      hover: "hover:bg-gray-50 dark:hover:bg-gray-800",
      badge: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
    },
    Right: {
      border: "border-[#FF3B3B]",
      bg: "bg-red-50/30 dark:bg-red-900/20",
      text: "text-[#FF3B3B]",
      hover: "hover:bg-red-50 dark:hover:bg-red-900/30",
      badge: "bg-[#FF3B3B]/10 dark:bg-[#FF3B3B]/20 text-[#FF3B3B] border-[#FF3B3B]/30",
    },
  };

  const colors = colorMap[perspective];

  if (articles.length === 0) {
    return (
      <Card className={`${colors.bg} border-2 ${colors.border} border-dashed dark:border-gray-700`}>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {emptyMessage || `No ${perspective.toLowerCase()} coverage available`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <article
          key={article.id}
          className={`border-l-4 ${colors.border} ${colors.bg} ${colors.hover} transition-all cursor-pointer group pl-4 py-4`}
        >
          <ArticleClickTracker articleId={article.id} />
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="flex items-start gap-4">
              {/* Source Logo/Icon - News Style */}
              <div className={`flex-shrink-0 w-10 h-10 rounded ${colors.badge} border flex items-center justify-center font-bold text-xs`}>
                {getSourceInitials(article.source)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#DC2626] transition-colors line-clamp-2 text-base leading-snug">
                    {article.title}
                  </h3>
                  <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1 group-hover:text-[#DC2626] transition-colors" />
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-bold text-gray-900 dark:text-gray-200 uppercase tracking-wide">{article.source}</span>
                  {article.publishedAt && (
                    <>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                    </>
                  )}
                </div>
                
                {article.summary && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                )}
              </div>
            </div>
          </a>
        </article>
      ))}
    </div>
  );
}

