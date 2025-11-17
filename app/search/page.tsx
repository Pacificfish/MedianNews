"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TopicFeedItem } from "@/components/topic-feed-item";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  topics: Array<{
    id: string;
    title: string;
    first_seen_at: string;
    last_seen_at: string;
    leftCount: number;
    centerCount: number;
    rightCount: number;
    totalSources: number;
    hasIncompleteCoverage: boolean;
  }>;
  articles: Array<{
    id: string;
    title: string;
    url: string;
    summary?: string;
    published_at: string;
    sources: { name: string };
  }>;
  query: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Failed to search");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    performSearch(query);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-gray-100 mb-2">Search</h1>
          <p className="text-gray-600 dark:text-gray-400">Search for topics and articles</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Search topics, articles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-12 text-base dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#3366FF] hover:bg-[#2952CC] text-white h-12 px-8 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-8">
            {/* Topics Results */}
            {results.topics.length > 0 && (
              <div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Topics ({results.topics.length})
                </h2>
                <div className="space-y-4">
                  {results.topics.map((topic) => (
                    <TopicFeedItem
                      key={topic.id}
                      topicId={topic.id}
                      title={topic.title}
                      publishedAt={topic.first_seen_at}
                      updatedAt={topic.last_seen_at}
                      leftCount={topic.leftCount}
                      centerCount={topic.centerCount}
                      rightCount={topic.rightCount}
                      totalSources={topic.totalSources}
                      hasIncompleteCoverage={topic.hasIncompleteCoverage}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Articles Results */}
            {results.articles.length > 0 && (
              <div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Articles ({results.articles.length})
                </h2>
                <div className="space-y-4">
                  {results.articles.map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-all border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                      <CardContent className="p-6">
                        <Link href={article.url} target="_blank" rel="noopener noreferrer" className="block group">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-[#DC2626] transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span className="font-semibold">{article.sources.name}</span>
                            {article.published_at && (
                              <>
                                <span>•</span>
                                <span>{new Date(article.published_at).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                          {article.summary && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                              {article.summary}
                            </p>
                          )}
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {results.topics.length === 0 && results.articles.length === 0 && !loading && (
              <Card className="dark:border-gray-700 dark:bg-gray-800">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No results found for &quot;{results.query}&quot;
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Initial State */}
        {!results && !loading && !error && (
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Enter a search query to find topics and articles
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

