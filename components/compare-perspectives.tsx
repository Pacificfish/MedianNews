"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  summary?: string;
  publishedAt?: string;
  bias: "Left" | "Center" | "Right";
  score: number;
  confidence: number;
}

interface ComparePerspectivesProps {
  leftArticles: Article[];
  centerArticles: Article[];
  rightArticles: Article[];
}

export function ComparePerspectives({
  leftArticles,
  centerArticles,
  rightArticles,
}: ComparePerspectivesProps) {
  const maxArticles = Math.max(
    leftArticles.length,
    centerArticles.length,
    rightArticles.length
  );

  // Get representative articles (best from each side)
  const leftArticle = leftArticles[0];
  const centerArticle = centerArticles[0];
  const rightArticle = rightArticles[0];

  if (!leftArticle && !centerArticle && !rightArticle) {
    return null;
  }

  return (
    <div id="compare" className="mt-12 scroll-mt-8">
      <div className="mb-6">
        <h2 className="news-headline text-3xl text-gray-900 dark:text-gray-100 mb-2">
          Compare Perspectives
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          See how different political perspectives cover this story
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Perspective */}
        {leftArticle && (
          <Card className="border-l-4 border-[#3366FF] dark:border-[#3366FF] bg-blue-50/30 dark:bg-blue-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-[#3366FF]">
                Left Perspective
              </CardTitle>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {leftArticles.length} article{leftArticles.length !== 1 ? "s" : ""}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <a
                  href={leftArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-[#3366FF] transition-colors line-clamp-2">
                    {leftArticle.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-semibold">{leftArticle.source}</span>
                    {leftArticle.publishedAt && (
                      <>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(leftArticle.publishedAt), { addSuffix: true })}</span>
                      </>
                    )}
                  </div>
                  {leftArticle.summary && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">
                      {leftArticle.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[#3366FF] text-sm font-medium">
                    <span>Read full article</span>
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </a>
              </div>
              {leftArticles.length > 1 && (
                <Link
                  href={`?view=left`}
                  className="block text-sm text-[#3366FF] hover:underline font-medium"
                >
                  View all {leftArticles.length} left articles →
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Center Perspective */}
        {centerArticle && (
          <Card className="border-l-4 border-gray-400 dark:border-gray-600 bg-gray-50/30 dark:bg-gray-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-gray-700 dark:text-gray-300">
                Center Perspective
              </CardTitle>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {centerArticles.length} article{centerArticles.length !== 1 ? "s" : ""}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <a
                  href={centerArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors line-clamp-2">
                    {centerArticle.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-semibold">{centerArticle.source}</span>
                    {centerArticle.publishedAt && (
                      <>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(centerArticle.publishedAt), { addSuffix: true })}</span>
                      </>
                    )}
                  </div>
                  {centerArticle.summary && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">
                      {centerArticle.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm font-medium">
                    <span>Read full article</span>
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </a>
              </div>
              {centerArticles.length > 1 && (
                <Link
                  href={`?view=center`}
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:underline font-medium"
                >
                  View all {centerArticles.length} center articles →
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Right Perspective */}
        {rightArticle && (
          <Card className="border-l-4 border-[#FF3B3B] dark:border-[#FF3B3B] bg-red-50/30 dark:bg-red-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-[#FF3B3B]">
                Right Perspective
              </CardTitle>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {rightArticles.length} article{rightArticles.length !== 1 ? "s" : ""}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <a
                  href={rightArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-[#FF3B3B] transition-colors line-clamp-2">
                    {rightArticle.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-semibold">{rightArticle.source}</span>
                    {rightArticle.publishedAt && (
                      <>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(rightArticle.publishedAt), { addSuffix: true })}</span>
                      </>
                    )}
                  </div>
                  {rightArticle.summary && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">
                      {rightArticle.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[#FF3B3B] text-sm font-medium">
                    <span>Read full article</span>
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </a>
              </div>
              {rightArticles.length > 1 && (
                <Link
                  href={`?view=right`}
                  className="block text-sm text-[#FF3B3B] hover:underline font-medium"
                >
                  View all {rightArticles.length} right articles →
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

