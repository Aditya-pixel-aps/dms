import React from "react";

type Tone = "gray" | "green" | "red" | "yellow" | "blue" | "purple";

const tones: Record<Tone, string> = {
  gray: "bg-gray-100 text-gray-700 border border-gray-200/50 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-700/50",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-100/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
  red: "bg-rose-50 text-rose-700 border border-rose-100/50 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
  yellow: "bg-amber-50 text-amber-800 border border-amber-100/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  blue: "bg-indigo-50 text-indigo-700 border border-indigo-100/50 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30",
  purple: "bg-purple-50 text-purple-700 border border-purple-100/50 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30",
};

export default function Badge({
  tone = "gray",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
