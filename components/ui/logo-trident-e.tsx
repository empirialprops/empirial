"use client";

import React from "react";

export type LogoVariant = "v1" | "v2" | "v3" | "v4" | "v5";

interface LogoTridentEProps {
  variant?: LogoVariant; // Kept for compatibility with other layout components
  className?: string;
  size?: number | string;
  themeMode?: "auto" | "dark" | "light"; // Supported custom override
}

export const LogoTridentE: React.FC<LogoTridentEProps> = ({
  className = "",
  size = 32,
  themeMode = "auto",
}) => {
  const dim = typeof size === "number" ? `${size}px` : size;

  // Determine background and text colors based on the requested themeMode override or global classes
  let containerStyle = "bg-white dark:bg-black text-black dark:text-white border border-zinc-200 dark:border-zinc-800";

  if (themeMode === "dark") {
    containerStyle = "bg-black text-white border border-zinc-800";
  } else if (themeMode === "light") {
    containerStyle = "bg-white text-black border border-zinc-200";
  }

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-full transition-all duration-300 shadow-sm ${containerStyle} ${className}`}
      style={{ width: dim, height: dim }}
      title="EMPIRIAL Trident Logo"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[60%] h-[60%] select-none pointer-events-none"
      >
        <path
          d="M50 12 L43 28 H47.5 V56 C38.5 54 32.5 46.5 32.5 36.5 C32.5 32 34 28 36 22 C31 24 28.5 29.5 28.5 36.5 C28.5 49.5 37 58.5 47.5 59.5 V65 C45.5 65.5 44.5 66.5 44.5 68 H55.5 C55.5 66.5 54.5 65.5 52.5 65 V59.5 C63 58.5 71.5 49.5 71.5 36.5 C71.5 29.5 69 24 64 22 C66 28 67.5 32 67.5 36.5 C67.5 46.5 61.5 54 52.5 56 V28 H57 Z"
          fill="currentColor"
        />
        <rect x="48.5" y="68" width="3" height="16" rx="1" fill="currentColor" />
        <circle cx="50" cy="65" r="2" fill="currentColor" />
      </svg>
    </div>
  );
};

export default LogoTridentE;
