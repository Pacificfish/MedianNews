"use client";

import { StoryCard } from "@/components/story-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SideLabel } from "@/types";
import { CompareSummary } from "@/lib/openai";

interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  bias: SideLabel;
  score: number;
  confidence: number;
  publishedAt?: string;
}

interface CompareColumnsProps {
  leftArticle?: Article;
  centerArticle?: Article;
  rightArticle?: Article;
  summary?: CompareSummary;
}

export function CompareColumns({
  leftArticle,
  centerArticle,
  rightArticle,
  summary,
}: CompareColumnsProps) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div className="space-y-5">
          <div className="pb-2 border-b-2 border-[#3366FF]">
            <h2 className="text-2xl font-heading font-bold text-[#3366FF]">
              Left
            </h2>
          </div>
          {leftArticle ? (
            <>
              <StoryCard
                title={leftArticle.title}
                source={leftArticle.source}
                url={leftArticle.url}
                bias={leftArticle.bias}
                score={leftArticle.score}
                confidence={leftArticle.confidence}
                publishedAt={leftArticle.publishedAt}
                summary={leftArticle.summary}
              />
              {summary?.left_points && summary.left_points.length > 0 && (
                <Card className="shadow-md border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Key Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {summary.left_points.map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-3 leading-relaxed">
                          <span className="text-[#3366FF] mt-1 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="shadow-md border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 text-sm font-medium">No left coverage available</div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <div className="pb-2 border-b-2 border-gray-400">
            <h2 className="text-2xl font-heading font-bold text-gray-700">
              Center
            </h2>
          </div>
          {centerArticle ? (
            <>
              <StoryCard
                title={centerArticle.title}
                source={centerArticle.source}
                url={centerArticle.url}
                bias={centerArticle.bias}
                score={centerArticle.score}
                confidence={centerArticle.confidence}
                publishedAt={centerArticle.publishedAt}
                summary={centerArticle.summary}
              />
              {summary?.center_points && summary.center_points.length > 0 && (
                <Card className="shadow-md border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Key Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {summary.center_points.map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-3 leading-relaxed">
                          <span className="text-gray-500 mt-1 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="shadow-md border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 text-sm font-medium">No center coverage available</div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <div className="pb-2 border-b-2 border-[#FF3B3B]">
            <h2 className="text-2xl font-heading font-bold text-[#FF3B3B]">
              Right
            </h2>
          </div>
          {rightArticle ? (
            <>
              <StoryCard
                title={rightArticle.title}
                source={rightArticle.source}
                url={rightArticle.url}
                bias={rightArticle.bias}
                score={rightArticle.score}
                confidence={rightArticle.confidence}
                publishedAt={rightArticle.publishedAt}
                summary={rightArticle.summary}
              />
              {summary?.right_points && summary.right_points.length > 0 && (
                <Card className="shadow-md border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Key Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {summary.right_points.map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-3 leading-relaxed">
                          <span className="text-[#FF3B3B] mt-1 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="shadow-md border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 text-sm font-medium">No right coverage available</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {summary?.neutral_recap && (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100/50 shadow-lg border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Neutral Summary</CardTitle>
            <p className="text-sm text-gray-500 mt-1">An unbiased overview of the story</p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed text-base">{summary.neutral_recap}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



