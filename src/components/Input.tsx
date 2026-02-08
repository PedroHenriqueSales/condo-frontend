import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className = "", ...props }: Props) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-1 text-sm font-medium text-text">{label}</div>
      ) : null}
      <input
        className={
          "h-11 w-full rounded-xl border bg-surface px-3 text-sm text-text shadow-soft " +
          "placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 " +
          (error ? "border-danger/60" : "border-border") +
          ` ${className}`
        }
        {...props}
      />
      {error ? <div className="mt-1 text-xs text-danger">{error}</div> : null}
    </label>
  );
}

