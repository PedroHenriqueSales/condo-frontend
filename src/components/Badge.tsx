import React from "react";

type Props = {
  children: React.ReactNode;
  tone?: "primary" | "accent" | "neutral" | "danger";
};

export function Badge({ children, tone = "neutral" }: Props) {
  const cls =
    tone === "primary"
      ? "bg-black/5 text-black border border-black/20 dark:bg-white/15 dark:text-white dark:border-white/25"
      : tone === "accent"
        ? "bg-black/5 text-black border border-black/20 dark:bg-white/15 dark:text-white dark:border-white/25"
        : tone === "danger"
          ? "bg-danger/10 text-danger border-danger/20"
          : "bg-surface text-muted border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

