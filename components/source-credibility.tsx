"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SourceCredibilityProps {
  sourceName: string;
  authorityScore?: number;
}

export function SourceCredibility({ sourceName, authorityScore = 0.5 }: SourceCredibilityProps) {
  const getCredibilityLevel = (score: number) => {
    if (score >= 0.8) return { level: "High", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle2 };
    if (score >= 0.6) return { level: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: Shield };
    return { level: "Low", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: AlertTriangle };
  };

  const credibility = getCredibilityLevel(authorityScore);
  const Icon = credibility.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${credibility.color}`}>
        <Icon className="h-3 w-3" />
        <span>{credibility.level} Credibility</span>
      </div>
    </div>
  );
}

