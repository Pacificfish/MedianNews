"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const categories = [
  "All",
  "Politics",
  "Elections",
  "Congress",
  "Supreme Court",
  "Immigration",
  "Economy",
  "Climate",
  "Healthcare",
  "Foreign Policy",
  "Technology",
];

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
        <span className="news-byline text-gray-500 dark:text-gray-400 mr-4 whitespace-nowrap">SECTIONS</span>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeCategory === category
                ? "text-[#DC2626] border-[#DC2626]"
                : "text-gray-700 dark:text-gray-300 border-transparent hover:text-[#DC2626] hover:border-[#DC2626]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

