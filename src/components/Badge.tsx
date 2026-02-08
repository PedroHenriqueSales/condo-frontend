import React from "react";

type Props = {
  children: React.ReactNode;
  tone?: "primary" | "neutral";
};

export function Badge({ children, tone = "neutral" }: Props) {
  const cls =
    tone === "primary"
      ? "bg-primary/10 text-primary-strong border-primary/20"
      : "bg-surface text-muted border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

