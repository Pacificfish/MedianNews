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
                  const response = await fetch("/api/discover-articles", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });
                  const data = await response.json();
                  if (!response.ok) throw new Error(data.error || "Discovery failed");
                  setResult(data);
                  
                  // Automatically rebuild homepage after discovery
                  try {
                    await fetch("/api/rebuild-homepage", { method: "POST" });
                  } catch (e) {
                    console.warn("Failed to rebuild homepage:", e);
                  }
                } catch (err: any) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full bg-[#3366FF] hover:bg-[#2952CC] text-white font-semibold text-lg py-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>Discovering Topics & Articles...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  <span>FORCE RUN: Discover Topics & Articles NOW</span>
                </span>
              )}
            </Button>
            <Button 
              onClick={async () => {
                setLoading(true);
                setError(null);
                setResult(null);
                try {
                  const response = await fetch("/api/rebuild-homepage", { method: "POST" });
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
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">
                <strong>Note:</strong> The "Force Run" button will:
              </p>
              <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                <li>Use AI to discover 12 hottest current political topics</li>
                <li>Search Google News comprehensively for ALL articles about each topic</li>
                <li>Find articles from Left, Center, and Right sources</li>
                <li>Only create topics with at least 2 different perspectives</li>
                <li>Automatically rebuild the homepage after discovery</li>
              </ul>
            </div>
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
              <h3 className="font-semibold mb-2 text-green-800">✅ Success!</h3>
              {result.message && (
                <p className="text-sm mb-3 font-medium text-green-700">{result.message}</p>
              )}
              <div className="text-sm space-y-2 bg-white p-3 rounded border border-green-100">
                {result.topicsDiscovered !== undefined && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-600">Topics Discovered:</span>
                        <span className="font-bold ml-2 text-gray-900">{result.topicsDiscovered}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Topics Created:</span>
                        <span className="font-bold ml-2 text-green-700">{result.topicsCreated}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Articles Found:</span>
                        <span className="font-bold ml-2 text-green-700">{result.articlesFound}</span>
                      </div>
                      {result.errors !== undefined && result.errors > 0 && (
                        <div>
                          <span className="text-gray-600">Errors:</span>
                          <span className="font-bold ml-2 text-red-600">{result.errors}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {result.topicsProcessed !== undefined && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-600">Topics Processed:</span>
                        <span className="font-bold ml-2">{result.topicsProcessed}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Homepage Entries:</span>
                        <span className="font-bold ml-2">{result.homepageEntriesCreated}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Built At:</span>
                        <span className="ml-2">{result.builtAt ? new Date(result.builtAt).toLocaleString() : "N/A"}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <p className="text-sm mt-3 text-green-700 font-medium">
                ✨ Check your homepage to see the new topics!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

