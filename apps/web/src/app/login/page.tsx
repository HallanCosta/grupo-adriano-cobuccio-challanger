import type { Metadata } from "next";
import { AuthCardHeader } from "@/components/gac/authCardHeader";
import { AuthShell } from "@/components/gac/authShell";
import { LoginForm } from "./loginForm";

export const metadata: Metadata = {
  title: {
    absolute: "Entrar | Grupo Adriano Cobuccio",
  },
};

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthCardHeader title="Entrar" description="Acesse sua carteira." />
      <LoginForm />
    </AuthShell>
  );
}
