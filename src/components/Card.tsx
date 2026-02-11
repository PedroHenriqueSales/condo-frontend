import React from "react";

type Props = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "", ...props }: Props) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-4 shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

