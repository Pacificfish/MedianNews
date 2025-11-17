"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Clock, BarChart3, Zap } from "lucide-react";

interface EnhancedFeaturesProps {
  totalSources: number;
  totalArticles: number;
  lastUpdated?: string;
  trending?: boolean;
}

export function EnhancedFeatures({
  totalSources,
  totalArticles,
  lastUpdated,
  trending = false,
}: EnhancedFeaturesProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">Sources</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalSources}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">Articles</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{totalArticles}</p>
        </CardContent>
      </Card>

      {lastUpdated && (
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-semibold text-green-900 dark:text-green-200">Updated</span>
            </div>
            <p className="text-sm font-bold text-green-900 dark:text-green-100">{lastUpdated}</p>
          </CardContent>
        </Card>
      )}

      {trending && (
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-semibold text-orange-900 dark:text-orange-200">Trending</span>
            </div>
            <p className="text-sm font-bold text-orange-900 dark:text-orange-100">Hot Story</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

