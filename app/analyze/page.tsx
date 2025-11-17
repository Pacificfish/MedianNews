"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StoryCard } from "@/components/story-card";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface AnalysisResult {
  article: {
    id: string;
    title: string;
    url: string;
    summary: string;
    published_at: string;
    sources: { name: string };
  };
  bias: {
    leaning: "Left" | "Center" | "Right";
    score: number;
    confidence: number;
    explanation: string;
  };
}

export default function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <div className="mb-10 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
          <h1 className="text-4xl font-heading font-bold mb-4 text-gray-900 dark:text-gray-100 tracking-tight">
            Analyze Article
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Enter a news article URL to see its political bias classification and understand how different perspectives might frame the story
          </p>
        </div>

        <Card className="mb-8 shadow-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl dark:text-gray-100">Article URL</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Paste any news article link to analyze its political bias</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="url"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                disabled={loading}
                className="flex-1 text-base h-12"
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="bg-[#3366FF] hover:bg-[#2952CC] text-white h-12 px-8 font-medium shadow-sm hover:shadow-md transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StoryCard
              title={result.article.title}
              source={result.article.sources.name}
              url={result.article.url}
              bias={result.bias.leaning}
              score={result.bias.score}
              confidence={result.bias.confidence}
              publishedAt={result.article.published_at}
              summary={result.article.summary}
            />
            <Card className="shadow-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl dark:text-gray-100">Analysis Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{result.bias.explanation}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}



