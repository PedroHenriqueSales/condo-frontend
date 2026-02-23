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
    <div className="flex w-full rounded-2xl border border-border bg-surface p-1 shadow-soft">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={
              "h-9 flex-1 rounded-xl text-center text-sm font-medium transition " +
              (active
                ? "bg-accent/10 text-accent-strong"
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

