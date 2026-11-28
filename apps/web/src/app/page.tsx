import Link from "next/link";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
        <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
          Desafio técnico
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Carteira financeira
        </h1>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          Grupo Adriano Cobuccio
        </p>
        <p className="mt-6 leading-7 text-zinc-600 dark:text-zinc-400">
          Frontend em Next.js (App Router, TypeScript, pronto para Server
          Actions) e API em Nest.js. A forma principal de rodar o ambiente é o
          Docker Compose na raiz do monorepo.
        </p>
        <nav className="mt-8 flex flex-col gap-3 text-sm font-medium sm:flex-row">
          <Link
            href="/cadastro"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-primary-foreground transition hover:opacity-90"
          >
            Criar conta
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-2.5 text-zinc-950 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Entrar
          </Link>
          <a
            href={`${apiUrl}/health`}
            className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-2.5 text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300"
          >
            Saúde da API
          </a>
          <a
            href={`${apiUrl}/metrics`}
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-2.5 text-zinc-950 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Métricas
          </a>
        </nav>
      </main>
    </div>
  );
}
