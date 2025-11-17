"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";

interface ClusterCardProps {
  topicId: string;
  title: string;
  lastSeenAt: string;
  leftArticle?: { id: string; title: string; url: string; source?: string };
  centerArticle?: { id: string; title: string; url: string; source?: string };
  rightArticle?: { id: string; title: string; url: string; source?: string };
  importanceScore: number;
  sourceCount?: number;
  articleCount?: number;
}

export function ClusterCard({
  topicId,
  title,
  lastSeenAt,
  leftArticle,
  centerArticle,
  rightArticle,
  importanceScore,
  sourceCount,
  articleCount,
}: ClusterCardProps) {
  const hasAllSides = leftArticle && centerArticle && rightArticle;
  const leftCount = leftArticle ? 1 : 0;
  const centerCount = centerArticle ? 1 : 0;
  const rightCount = rightArticle ? 1 : 0;
  const total = leftCount + centerCount + rightCount;
  const leftPercent = total > 0 ? (leftCount / total) * 100 : 0;
  const centerPercent = total > 0 ? (centerCount / total) * 100 : 0;
  const rightPercent = total > 0 ? (rightCount / total) * 100 : 0;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 overflow-hidden bg-white">
      <CardHeader className="pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3 mb-3">
          <CardTitle className="text-xl font-heading font-bold line-clamp-2 flex-1 leading-tight text-gray-900 group-hover:text-[#3366FF] transition-colors">
            {title}
          </CardTitle>
              {!hasAllSides && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200 shrink-0 uppercase tracking-wide">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Incomplete</span>
                </div>
              )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDistanceToNow(new Date(lastSeenAt), { addSuffix: true })}</span>
          {sourceCount !== undefined && (
            <>
              <span>•</span>
              <span>{sourceCount} sources</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Bias Distribution Bar */}
          <div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex mb-3">
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
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>L {leftPercent > 0 ? `${Math.round(leftPercent)}%` : ''}</span>
              <span>C {centerPercent > 0 ? `${Math.round(centerPercent)}%` : ''}</span>
              <span>R {rightPercent > 0 ? `${Math.round(rightPercent)}%` : ''}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {leftArticle ? (
              <div className="p-3 bg-blue-50/50 rounded border-l-4 border-[#3366FF] hover:bg-blue-50 transition-colors group/article">
                <div className="font-bold text-xs text-[#3366FF] mb-2 uppercase tracking-wider">Left</div>
                <div className="text-sm text-gray-900 line-clamp-3 leading-snug font-medium group-hover/article:text-[#3366FF] transition-colors">
                  {leftArticle.title}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center justify-center min-h-[80px]">
                <div className="text-xs text-gray-400 text-center font-medium">No Left coverage</div>
              </div>
            )}
            {centerArticle ? (
              <div className="p-3 bg-gray-50/50 rounded border-l-4 border-gray-400 hover:bg-gray-100 transition-colors group/article">
                <div className="font-bold text-xs text-gray-600 mb-2 uppercase tracking-wider">Center</div>
                <div className="text-sm text-gray-900 line-clamp-3 leading-snug font-medium group-hover/article:text-gray-700 transition-colors">
                  {centerArticle.title}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center justify-center min-h-[80px]">
                <div className="text-xs text-gray-400 text-center font-medium">No Center coverage</div>
              </div>
            )}
            {rightArticle ? (
              <div className="p-3 bg-red-50/50 rounded border-l-4 border-[#FF3B3B] hover:bg-red-50 transition-colors group/article">
                <div className="font-bold text-xs text-[#FF3B3B] mb-2 uppercase tracking-wider">Right</div>
                <div className="text-sm text-gray-900 line-clamp-3 leading-snug font-medium group-hover/article:text-[#FF3B3B] transition-colors">
                  {rightArticle.title}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center justify-center min-h-[80px]">
                <div className="text-xs text-gray-400 text-center font-medium">No Right coverage</div>
              </div>
            )}
          </div>

          <Link 
            href={`/topic/${topicId}`}
            className="w-full group/btn bg-[#3366FF] hover:bg-[#2952CC] text-white font-semibold shadow-sm hover:shadow transition-all duration-200 uppercase tracking-wide text-sm inline-flex items-center justify-center rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"
          >
            <span>Compare Coverage</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}



