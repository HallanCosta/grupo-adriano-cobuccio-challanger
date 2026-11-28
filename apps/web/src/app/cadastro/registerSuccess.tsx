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
    <Link
      href="/"
      className="mt-4 inline-block text-sm font-semibold text-gold transition hover:text-gold-light"
    >
      Voltar ao início
    </Link>
  </div>
);
