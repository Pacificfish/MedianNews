"use client";

import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "light" | "dark";
}

export function Logo({ className = "", showText = true, variant = "dark" }: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-gray-900 dark:text-gray-100";
  const subtextColor = variant === "light" ? "text-gray-300" : "text-gray-500 dark:text-gray-400";
  
  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      {/* Modern Logo Icon */}
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3366FF] via-[#2952CC] to-[#1E40AF] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm"
          >
            {/* Modern "M" letterform with perspective lines */}
            <path
              d="M7 8L14 20L21 8"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M7 8V20M21 8V20"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Perspective indicator lines */}
            <line
              x1="7"
              y1="20"
              x2="14"
              y2="20"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            <line
              x1="14"
              y1="20"
              x2="21"
              y2="20"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
        </div>
        {/* Modern accent indicator */}
        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-[#FF3B3B] to-[#E02E2E] rounded-full border-2 border-white dark:border-gray-900 shadow-md"></div>
      </div>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-heading font-black text-2xl tracking-tight ${textColor} group-hover:text-[#3366FF] dark:group-hover:text-[#3366FF] transition-colors`}>
            MEDIAN
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${subtextColor} mt-0.5`}>
            NEWS
          </span>
        </div>
      )}
    </Link>
  );
}

