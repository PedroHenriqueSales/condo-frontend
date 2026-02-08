import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
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
    "focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed";

  const sizes = {
    sm: "h-9 text-sm",
    md: "h-10 text-sm",
  }[size];

  const variants = {
    primary:
      "bg-primary text-white shadow-soft hover:bg-primary-strong active:bg-primary-strong",
    ghost:
      "bg-transparent text-text border border-border hover:bg-surface/60 active:bg-surface",
    danger:
      "bg-danger text-white shadow-soft hover:opacity-95 active:opacity-90",
  }[variant];

  return <button className={`${base} ${sizes} ${variants} ${className}`} {...props} />;
}

