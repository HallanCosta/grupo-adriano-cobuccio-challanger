import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { BrandHeader } from "./brandHeader";
import { DecorativeBackground } from "./decorativeBackground";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

type AuthShellProps = {
  children: ReactNode;
};

/** Page frame shared by the signed-out screens: background, brand and card. */
export const AuthShell = ({ children }: AuthShellProps) => (
  <div
    className={`${inter.className} relative flex min-h-svh flex-1 flex-col items-center justify-center gap-6 overflow-x-hidden bg-[radial-gradient(ellipse_at_50%_30%,var(--navy-soft)_0%,var(--navy)_70%)] px-4 py-6 text-white`}
  >
    <DecorativeBackground />
    <BrandHeader />
    <main className="relative z-10 w-full max-w-sm rounded-2xl border border-navy-card-border bg-navy-card p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-[8px] sm:p-8">
      {children}
    </main>
  </div>
);
