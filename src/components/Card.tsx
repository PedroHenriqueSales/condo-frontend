import React from "react";

type Props = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "", ...props }: Props) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-4 dark:shadow-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

