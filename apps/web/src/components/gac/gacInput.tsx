import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/input";
import { ErrorIcon } from "./errorIcon";

export type GACInputProps = Omit<
  ComponentProps<typeof Input>,
  "aria-invalid" | "aria-describedby"
> & {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Rendered after the input inside the field, e.g. a show/hide button. */
  endAdornment?: ReactNode;
  error?: string;
};

export const GACInput = ({
  id,
  label,
  icon,
  endAdornment,
  error,
  className,
  ...inputProps
}: GACInputProps) => {
  const isInvalid = Boolean(error);
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div
        className={`flex h-10 items-center gap-2 rounded-md border bg-navy-input px-3 transition-[border-color,box-shadow] duration-200 ${
          isInvalid
            ? "border-danger"
            : "border-navy-input-border focus-within:border-gold focus-within:shadow-[0_0_0_3px_rgba(240,184,74,0.18)]"
        }`}
      >
        {icon ? (
          <span className="flex size-4 shrink-0 items-center justify-center [&>svg]:size-4">
            {icon}
          </span>
        ) : null}
        <Input
          {...inputProps}
          id={id}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? errorId : undefined}
          className={[
            "min-w-0 flex-1 bg-transparent [font-family:inherit] text-sm text-navy-input-text caret-white outline-none placeholder:text-navy-placeholder",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {endAdornment}
      </div>
      {isInvalid ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1 flex items-center gap-1.5 text-xs text-danger"
        >
          <ErrorIcon className="size-3.5 shrink-0 stroke-danger" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
};
