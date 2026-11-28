import { Button, type ButtonProps } from "@/components/button";

const buttonClassName =
  "h-10 w-full cursor-pointer rounded-full bg-linear-to-b from-gold-light to-gold-dark text-sm font-semibold text-gold-foreground shadow-[0_4px_12px_rgba(240,184,74,0.25)] transition-[transform,filter,box-shadow] duration-150 hover:shadow-[0_6px_16px_rgba(240,184,74,0.35)] hover:brightness-[1.06] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-[0_4px_12px_rgba(240,184,74,0.25)] disabled:hover:brightness-100";

export type GACButtonProps = ButtonProps & {
  pending?: boolean;
  loadingText?: string;
};

export const GACButton = ({
  children,
  className,
  pending = false,
  loadingText,
  disabled,
  ...props
}: GACButtonProps) => (
  <Button
    {...props}
    disabled={pending || disabled}
    aria-busy={pending || undefined}
    className={[buttonClassName, className].filter(Boolean).join(" ")}
  >
    {pending && loadingText ? loadingText : children}
  </Button>
);
