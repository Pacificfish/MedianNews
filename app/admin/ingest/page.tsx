"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IngestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Article Discovery</h1>
        <p className="text-gray-600">
          Discover political topics and find articles from different perspectives
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🔍 Discover Articles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Uses ChatGPT to discover current political topics, then searches Google News to find articles from Left, Center, and Right sources.
            Only creates topics with at least 2 different political perspectives.
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>AI discovers 10 hottest current political topics</li>
            <li>Searches Google News for each topic</li>
            <li>Matches articles to sources in database by domain</li>
            <li>Selects 1 article from each perspective (Left/Center/Right)</li>
            <li>Only creates topics with at least 2 different perspectives</li>
          </ul>
          <div className="space-y-2">
            <Button 
              onClick={async () => {
                setLoading(true);
                setError(null);
                setResult(null);
                try {
                  const response = await fetch("/api/discover-articles");
                  const data = await response.json();
                  if (!response.ok) throw new Error(data.error || "Discovery failed");
                  setResult(data);
                } catch (err: any) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Discovering..." : "🔍 Discover Topics & Articles"}
            </Button>
            <Button 
              onClick={async () => {
                setLoading(true);
                setError(null);
                setResult(null);
                try {
                  const response = await fetch("/api/rebuild-homepage");
                  const data = await response.json();
                  if (!response.ok) throw new Error(data.error || "Rebuild failed");
                  setResult(data);
                } catch (err: any) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? "Rebuilding..." : "🏠 Rebuild Homepage"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🗑️ Clear All Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This will permanently delete all articles, topics, and homepage data from the database.
            This action cannot be undone.
          </p>
          <Button 
            onClick={async () => {
              if (!confirm("⚠️ WARNING: This will delete ALL articles, topics, and homepage data. Are you sure?")) {
                return;
              }
              setLoading(true);
              setError(null);
              setResult(null);
              try {
                const response = await fetch("/api/clear-all-data", { method: "POST" });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Clear failed");
                setResult({ message: "All data cleared successfully." });
              } catch (err: any) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            variant="outline"
            className="w-full bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
          >
            {loading ? "Clearing..." : "🗑️ Clear All Data"}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold mb-2">Success!</h3>
              {result.message && (
                <p className="text-sm mb-2">{result.message}</p>
              )}
              <div className="text-sm space-y-1">
                {result.topicsDiscovered !== undefined && (
                  <>
                    <p><strong>Topics Discovered:</strong> {result.topicsDiscovered}</p>
                    <p><strong>Topics Created:</strong> {result.topicsCreated}</p>
                    <p><strong>Articles Found:</strong> {result.articlesFound}</p>
                    {result.errors !== undefined && (
                      <p><strong>Errors:</strong> {result.errors}</p>
                    )}
                  </>
                )}
                {result.topicsProcessed !== undefined && (
                  <>
                    <p><strong>Topics Processed:</strong> {result.topicsProcessed}</p>
                    <p><strong>Homepage Entries:</strong> {result.homepageEntriesCreated}</p>
                    <p><strong>Built At:</strong> {result.builtAt ? new Date(result.builtAt).toLocaleString() : "N/A"}</p>
                  </>
                )}
              </div>
              <p className="text-sm mt-3 text-gray-600">
                Check your homepage to see the new topics!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

