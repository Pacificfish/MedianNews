import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";

interface FeaturedStoryProps {
  topicId: string;
  title: string;
  leftArticle?: { title: string; url: string; source?: string };
  centerArticle?: { title: string; url: string; source?: string };
  rightArticle?: { title: string; url: string; source?: string };
  sourceCount?: number;
  articleCount?: number;
  publishedAt?: string;
}

export function FeaturedStory({
  topicId,
  title,
  leftArticle,
  centerArticle,
  rightArticle,
  sourceCount = 0,
  articleCount = 0,
  publishedAt,
}: FeaturedStoryProps) {
  const hasAllSides = leftArticle && centerArticle && rightArticle;
  const leftCount = leftArticle ? 1 : 0;
  const centerCount = centerArticle ? 1 : 0;
  const rightCount = rightArticle ? 1 : 0;
  const total = leftCount + centerCount + rightCount;
  const leftPercent = total > 0 ? (leftCount / total) * 100 : 0;
  const centerPercent = total > 0 ? (centerCount / total) * 100 : 0;
  const rightPercent = total > 0 ? (rightCount / total) * 100 : 0;

  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-heading font-bold mb-3 leading-tight text-gray-900">
            <Link href={`/topic/${topicId}`} className="hover:text-[#3366FF] transition-colors">
              {title}
            </Link>
          </h2>
          {publishedAt && (
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}
            </p>
          )}
        </div>

        {/* Bias Distribution Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-2">
            <span>Left {leftPercent > 0 ? `${Math.round(leftPercent)}%` : ''}</span>
            <span>Center {centerPercent > 0 ? `${Math.round(centerPercent)}%` : ''}</span>
            <span>Right {rightPercent > 0 ? `${Math.round(rightPercent)}%` : ''}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
            {leftPercent > 0 && (
              <div 
                className="bg-[#3366FF] transition-all"
                style={{ width: `${leftPercent}%` }}
              />
            )}
            {centerPercent > 0 && (
              <div 
                className="bg-gray-400 transition-all"
                style={{ width: `${centerPercent}%` }}
              />
            )}
            {rightPercent > 0 && (
              <div 
                className="bg-[#FF3B3B] transition-all"
                style={{ width: `${rightPercent}%` }}
              />
            )}
          </div>
        </div>

        {/* Source Count */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="font-medium">{sourceCount} sources</span>
          <span>•</span>
          <span>{articleCount} articles</span>
        </div>

        {/* Article Links */}
        <div className="space-y-2">
          {leftArticle && (
            <a
              href={leftArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 p-2 rounded hover:bg-blue-50 transition-colors group"
            >
              <span className="text-xs font-bold text-[#3366FF] mt-1">L</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#3366FF] transition-colors">
                  {leftArticle.title}
                </p>
                {leftArticle.source && (
                  <p className="text-xs text-gray-500 mt-1">{leftArticle.source}</p>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
            </a>
          )}
          {centerArticle && (
            <a
              href={centerArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 transition-colors group"
            >
              <span className="text-xs font-bold text-gray-600 mt-1">C</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors">
                  {centerArticle.title}
                </p>
                {centerArticle.source && (
                  <p className="text-xs text-gray-500 mt-1">{centerArticle.source}</p>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
            </a>
          )}
          {rightArticle && (
            <a
              href={rightArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 p-2 rounded hover:bg-red-50 transition-colors group"
            >
              <span className="text-xs font-bold text-[#FF3B3B] mt-1">R</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#FF3B3B] transition-colors">
                  {rightArticle.title}
                </p>
                {rightArticle.source && (
                  <p className="text-xs text-gray-500 mt-1">{rightArticle.source}</p>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
            </a>
          )}
        </div>

        <Link 
          href={`/topic/${topicId}`}
          className="mt-4 inline-block text-sm font-semibold text-[#3366FF] hover:text-[#2952CC] transition-colors"
        >
          Compare Coverage →
        </Link>
      </div>
    </Card>
  );
}

