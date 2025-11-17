"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CoverageStatsProps {
  totalSources: number;
  leftCount: number;
  centerCount: number;
  rightCount: number;
  lastUpdated?: string;
  sourceNames?: string[];
}

function getSourceInitials(source: string): string {
  return source
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function CoverageStats({
  totalSources,
  leftCount,
  centerCount,
  rightCount,
  lastUpdated,
  sourceNames = [],
}: CoverageStatsProps) {
  const total = leftCount + centerCount + rightCount;
  const leftPercent = total > 0 ? Math.round((leftCount / total) * 100) : 0;
  const centerPercent = total > 0 ? Math.round((centerCount / total) * 100) : 0;
  const rightPercent = total > 0 ? Math.round((rightCount / total) * 100) : 0;

  return (
    <Card className="border-gray-200 dark:border-gray-700 shadow-sm dark:bg-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold dark:text-gray-100">Coverage Details</CardTitle>
        {lastUpdated && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last Updated: {lastUpdated}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total News Sources</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">{totalSources}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#3366FF] font-medium">Leaning Left</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">{leftCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Center</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">{centerCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#FF3B3B] font-medium">Leaning Right</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">{rightCount}</span>
          </div>
        </div>

        {/* Distribution Bar */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            <span>Bias Distribution</span>
            {centerPercent > 0 && (
              <span className="text-gray-500 dark:text-gray-400">• {centerPercent}% Center</span>
            )}
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex mb-2">
            {leftPercent > 0 && (
              <div
                className="bg-[#3366FF] transition-all"
                style={{ width: `${leftPercent}%` }}
                title={`${leftPercent}% Left`}
              />
            )}
            {centerPercent > 0 && (
              <div
                className="bg-gray-400 transition-all"
                style={{ width: `${centerPercent}%` }}
                title={`${centerPercent}% Center`}
              />
            )}
            {rightPercent > 0 && (
              <div
                className="bg-[#FF3B3B] transition-all"
                style={{ width: `${rightPercent}%` }}
                title={`${rightPercent}% Right`}
              />
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>L {leftPercent}%</span>
            <span>C {centerPercent}%</span>
            <span>R {rightPercent}%</span>
          </div>
        </div>

        {/* Source Logos */}
        {sourceNames.length > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">Sources</p>
            <div className="flex flex-wrap gap-2">
              {sourceNames.slice(0, 12).map((source, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300"
                  title={source}
                >
                  {getSourceInitials(source)}
                </div>
              ))}
              {sourceNames.length > 12 && (
                <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                  +{sourceNames.length - 12}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

