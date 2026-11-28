import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/gac/authShell";
import { CarteiraContent } from "./carteiraContent";

export const metadata: Metadata = {
  title: {
    absolute: "Carteira | Grupo Adriano Cobuccio",
  },
};

export default function CarteiraPage() {
  return (
    <AuthShell>
      <Suspense
        fallback={<p className="text-sm text-navy-muted">Carregando…</p>}
      >
        <CarteiraContent />
      </Suspense>
    </AuthShell>
  );
}
