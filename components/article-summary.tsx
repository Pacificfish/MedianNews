"use client";

import { Card, CardContent } from "@/components/ui/card";

interface ArticleSummaryProps {
  articles: Array<{
    title: string;
    source: string;
    summary?: string;
  }>;
}

export function ArticleSummary({ articles }: ArticleSummaryProps) {
  if (articles.length === 0) {
    return null;
  }

  // Extract key points from summaries
  // Combine all summaries and extract meaningful sentences
  const allText = articles
    .map(a => a.summary || a.title)
    .join(" ");

  // Simple extraction: split by sentences and filter meaningful ones
  const sentences = allText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 200)
    .slice(0, 5);

  if (sentences.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Story Summary</h3>
        <ul className="space-y-3">
          {sentences.map((point, idx) => (
            <li key={idx} className="text-sm text-gray-700 flex items-start gap-3 leading-relaxed">
              <span className="text-[#3366FF] mt-1 font-bold flex-shrink-0">•</span>
              <span>{point}.</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 mt-4 italic">
          Summary generated from multiple sources
        </p>
      </CardContent>
    </Card>
  );
}

