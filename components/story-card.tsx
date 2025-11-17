"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BiasBar } from "@/components/bias-bar";
import { SideLabel } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";

interface StoryCardProps {
  title: string;
  source: string;
  url: string;
  bias: SideLabel;
  score: number;
  confidence: number;
  publishedAt?: string;
  summary?: string;
}

export function StoryCard({
  title,
  source,
  url,
  bias,
  score,
  confidence,
  publishedAt,
  summary,
}: StoryCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <CardTitle className="text-xl font-heading font-bold line-clamp-3 leading-tight text-gray-900">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#3366FF] transition-colors"
            >
              {title}
            </a>
          </CardTitle>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-1"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className="font-semibold text-gray-700">{source}</span>
          {publishedAt && (
            <>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {summary && (
          <p className="text-sm text-gray-700 mb-4 leading-relaxed line-clamp-3">{summary}</p>
        )}
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wide"
              style={{
                backgroundColor:
                  bias === "Left"
                    ? "#3366FF15"
                    : bias === "Right"
                    ? "#FF3B3B15"
                    : "#D1D5DB40",
                color:
                  bias === "Left"
                    ? "#3366FF"
                    : bias === "Right"
                    ? "#FF3B3B"
                    : "#1E293B",
                border: `1px solid ${
                  bias === "Left"
                    ? "#3366FF40"
                    : bias === "Right"
                    ? "#FF3B3B40"
                    : "#D1D5DB"
                }`,
              }}
            >
              {bias}
            </span>
            {confidence >= 70 && (
              <span className="text-xs text-gray-500 font-medium">High confidence</span>
            )}
          </div>
          <BiasBar score={score} leaning={bias} confidence={confidence} />
        </div>
      </CardContent>
    </Card>
  );
}



