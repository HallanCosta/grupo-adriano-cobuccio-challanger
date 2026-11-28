import { UserIcon } from "./fieldIcons";

export const RegisterCardHeader = () => (
  <div className="relative mb-6 flex items-center gap-3 pb-4 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-linear-to-r after:from-gold after:to-gold/15">
    <div className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-gold bg-white/[0.02]">
      <UserIcon className="size-5 stroke-white" />
    </div>
    <div>
      <h1 className="text-2xl leading-tight font-semibold">Criar conta</h1>
      <p className="mt-1 text-sm text-navy-muted">
        Cadastre-se para abrir sua carteira.
      </p>
    </div>
  </div>
);
