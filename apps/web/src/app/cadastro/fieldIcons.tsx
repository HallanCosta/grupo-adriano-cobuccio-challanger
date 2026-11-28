type IconProps = {
  className?: string;
};

export const UserIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20.5v-1.2c0-3 2.7-5 7.5-5s7.5 2 7.5 5v1.2z" />
  </svg>
);

export const EmailIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <rect x="2.5" y="5" width="19" height="14" rx="2" />
    <path d="M3 6.5l9 7 9-7" />
  </svg>
);

export const LockIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <circle cx="12" cy="15.5" r=".6" fill="currentColor" />
  </svg>
);
