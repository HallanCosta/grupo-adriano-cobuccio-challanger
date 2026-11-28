import Link from "next/link";

type RegisterSuccessProps = {
  name: string;
  email: string;
};

export const RegisterSuccess = ({ name, email }: RegisterSuccessProps) => (
  <div role="status">
    <p className="text-lg leading-tight font-semibold">
      Conta criada, {name}!
    </p>
    <p className="mt-1 text-sm text-navy-muted">
      Sua carteira foi aberta com saldo R$ 0,00 para {email}.
    </p>
    <div className="mt-4 flex items-center gap-4 text-sm font-semibold">
      <Link
        href="/login"
        className="text-gold transition hover:text-gold-light"
      >
        Entrar na conta
      </Link>
      <Link
        href="/"
        className="text-navy-muted transition hover:text-white"
      >
        Voltar ao início
      </Link>
    </div>
  </div>
);
