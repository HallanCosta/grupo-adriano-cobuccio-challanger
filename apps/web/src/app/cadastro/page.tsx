import type { Metadata } from "next";
import { AuthCardHeader } from "@/components/gac/authCardHeader";
import { AuthShell } from "@/components/gac/authShell";
import { RegisterForm } from "./registerForm";

export const metadata: Metadata = {
  title: {
    absolute: "Criar conta | Grupo Adriano Cobuccio",
  },
};

export default function CadastroPage() {
  return (
    <AuthShell>
      <AuthCardHeader
        title="Criar conta"
        description="Cadastre-se para abrir sua carteira."
      />
      <RegisterForm />
    </AuthShell>
  );
}
