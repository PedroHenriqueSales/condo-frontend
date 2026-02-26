import React from "react";

type Props = {
  children: React.ReactNode;
  tone?: "primary" | "accent" | "neutral" | "danger";
};

export function Badge({ children, tone = "neutral" }: Props) {
  const cls =
    tone === "primary"
      ? "bg-primary/10 text-primary-strong border-primary/20"
      : tone === "accent"
        ? "bg-accent/10 text-accent-strong border-accent/20"
        : tone === "danger"
          ? "bg-danger/10 text-danger border-danger/20"
          : "bg-surface text-muted border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

