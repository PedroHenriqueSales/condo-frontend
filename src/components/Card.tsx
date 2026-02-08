import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: Props) {
  return (
    <div className={`rounded-2xl border border-border bg-surface p-4 shadow-card ${className}`}>
      {children}
    </div>
  );
}

