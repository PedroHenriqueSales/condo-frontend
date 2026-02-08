export type TabOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  options: TabOption<T>[];
  onChange: (value: T) => void;
};

export function Tabs<T extends string>({ value, options, onChange }: Props<T>) {
  return (
    <div className="inline-flex rounded-2xl border border-border bg-surface p-1 shadow-soft">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={
              "h-9 rounded-xl px-3 text-sm font-medium transition " +
              (active
                ? "bg-primary/10 text-primary-strong"
                : "text-muted hover:bg-surface/70")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

