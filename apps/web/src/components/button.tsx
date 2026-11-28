import type { ComponentProps } from "react";

export type ButtonProps = ComponentProps<"button">;

export const Button = ({
  type = "button",
  className,
  ...props
}: ButtonProps) => <button {...props} type={type} className={className} />;
