import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "accent" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 font-medium transition " +
    "focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed";

  const sizes = {
    sm: "h-9 text-sm",
    md: "h-10 text-sm",
  }[size];

  const variants = {
    primary:
      "bg-primary/50 text-white shadow-soft hover:bg-primary/65 active:bg-primary/60 focus:ring-primary/40",
    accent:
      "bg-accent/50 text-white shadow-soft hover:bg-accent/65 active:bg-accent/60 focus:ring-accent/40",
    ghost:
      "bg-transparent text-text border border-border hover:bg-surface/60 active:bg-surface focus:ring-primary/40",
    danger:
      "bg-danger/50 text-white shadow-soft hover:bg-danger/65 active:bg-danger/60 focus:ring-danger/40",
  }[variant];

  return <button className={`${base} ${sizes} ${variants} ${className}`} {...props} />;
}

