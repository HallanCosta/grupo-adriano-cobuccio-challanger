export const DecorativeBackground = () => (
  <svg
    className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    viewBox="0 0 1672 941"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="authBgBlue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#06335c" stopOpacity=".9" />
        <stop offset="1" stopColor="#021a33" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0 0 H230 C190 60 150 122 90 122 H0 Z"
      fill="#04284a"
      opacity=".8"
    />
    <path
      d="M0 340 H210 C270 340 290 380 270 430 C230 520 110 640 0 760 Z"
      fill="#05294c"
      opacity=".75"
    />
    <path
      d="M0 465 H80 C120 465 120 500 100 530 L0 680 Z"
      fill="#031f3b"
      opacity=".9"
    />
    <path
      d="M1672 0 H1640 C1560 130 1450 300 1320 345 C1280 360 1240 372 1200 374 V0 Z"
      fill="url(#authBgBlue)"
      opacity=".5"
    />
    <path
      d="M1672 680 C1560 690 1480 760 1400 941 H1672 Z"
      fill="#05345c"
      opacity=".7"
    />
    <g fill="none" stroke="#e0a93e" strokeWidth="2" opacity=".85">
      <path d="M452 0 C400 90 330 180 270 215 C220 245 150 250 0 250" />
      <path d="M1672 520 C1580 525 1500 570 1440 650 C1380 735 1300 850 1230 941" />
    </g>
  </svg>
);
