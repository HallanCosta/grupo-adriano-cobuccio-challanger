type ErrorIconProps = {
  className?: string;
};

export const ErrorIcon = ({ className }: ErrorIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
    className={className}
  >
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 7v6" />
    <circle cx="12" cy="16.5" r=".5" fill="currentColor" />
  </svg>
);
