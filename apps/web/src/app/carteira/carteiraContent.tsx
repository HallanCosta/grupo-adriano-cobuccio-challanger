import { redirect } from "next/navigation";
import { AuthCardHeader } from "@/components/gac/authCardHeader";
import { GACButton } from "@/components/gac/gacButton";
import { getCurrentUser } from "@/lib/currentUser";
import { logout } from "./actions";

/** Reads the session per request, so it must render behind a Suspense boundary. */
export const CarteiraContent = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <AuthCardHeader title="Sua carteira" description={`Olá, ${user.name}!`} />
      <p className="text-sm text-navy-muted">Você entrou como {user.email}.</p>
      <form action={logout} className="mt-6">
        <GACButton type="submit">Sair</GACButton>
      </form>
    </>
  );
};
