"use client";

import { getBiasColor } from "@/lib/utils";
import { SideLabel } from "@/types";

interface BiasBarProps {
  score: number; // 0-100, where 0=Left, 50=Center, 100=Right
  leaning: SideLabel;
  confidence?: number;
  showLabels?: boolean;
  className?: string;
}

export function BiasBar({
  score,
  leaning,
  confidence,
  showLabels = true,
  className = "",
}: BiasBarProps) {
  // Score: 0 = pure Left, 50 = Center, 100 = pure Right
  // Simple visualization: show position on spectrum with a filled bar
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Calculate fill position and color based on score
  // Score 0 = 0% (left edge), Score 50 = 50% (center), Score 100 = 100% (right edge)
  const fillPosition = normalizedScore;
  
  // Determine color based on position
  let fillColor;
  if (normalizedScore < 33) {
    fillColor = getBiasColor("Left");
  } else if (normalizedScore > 67) {
    fillColor = getBiasColor("Right");
  } else {
    fillColor = getBiasColor("Center");
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Left</span>
          <span>Center</span>
          <span>Right</span>
        </div>
      )}
      <div className="relative h-4 w-full rounded-full overflow-hidden" style={{
        background: `linear-gradient(to right, ${getBiasColor("Left")} 0%, ${getBiasColor("Center")} 50%, ${getBiasColor("Right")} 100%)`
      }}>
        {/* Indicator line showing exact position */}
        <div 
          className="absolute h-full w-1 bg-white border-2 border-gray-800 rounded-full transition-all"
          style={{
            left: `${fillPosition}%`,
            transform: "translateX(-50%)",
            zIndex: 10,
            boxShadow: "0 0 4px rgba(0,0,0,0.3)",
          }}
        />
        {/* Fill from left to show position */}
        <div 
          className="absolute h-full transition-all rounded-full opacity-60"
          style={{
            width: `${fillPosition}%`,
            backgroundColor: fillColor,
            left: 0,
          }}
        />
      </div>
      {confidence !== undefined && (
        <div className="mt-1 text-xs text-gray-500">
          Confidence: {confidence}%
        </div>
      )}
    </div>
  );
}

