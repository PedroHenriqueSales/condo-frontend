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
      "bg-primary text-white shadow-soft hover:bg-primary-strong active:bg-primary-strong focus:ring-primary/40",
    accent:
      "bg-accent text-white shadow-soft hover:bg-accent-strong active:bg-accent-strong focus:ring-accent/40",
    ghost:
      "bg-transparent text-text border border-border hover:bg-surface/60 active:bg-surface focus:ring-primary/40",
    danger:
      "bg-danger text-white shadow-soft hover:opacity-95 active:opacity-90 focus:ring-danger/40",
  }[variant];

  return <button className={`${base} ${sizes} ${variants} ${className}`} {...props} />;
}

