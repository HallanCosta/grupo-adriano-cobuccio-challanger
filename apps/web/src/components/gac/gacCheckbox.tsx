import type { ComponentProps, ReactNode } from "react";

export type GACCheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label: ReactNode;
};

export const GACCheckbox = ({ label, className, ...inputProps }: GACCheckboxProps) => (
  <label className="flex cursor-pointer items-center gap-2 text-sm text-navy-muted select-none">
    <span className="relative grid size-4 shrink-0 place-items-center">
      <input
        {...inputProps}
        type="checkbox"
        className={[
          "peer size-4 cursor-pointer appearance-none rounded-[4px] border border-navy-input-border bg-navy-input transition-colors checked:border-gold checked:bg-gold focus-visible:shadow-[0_0_0_3px_rgba(240,184,74,0.18)] focus-visible:outline-none",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="pointer-events-none absolute size-3 stroke-gold-foreground opacity-0 peer-checked:opacity-100"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
    {label}
  </label>
);
