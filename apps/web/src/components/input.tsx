import type { ComponentProps } from "react";

export type InputProps = ComponentProps<"input">;

export const Input = ({ className, ...props }: InputProps) => (
  <input className={className} {...props} />
);
