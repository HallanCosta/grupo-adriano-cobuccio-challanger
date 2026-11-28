"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ErrorIcon } from "@/components/gac/errorIcon";
import {
  EmailIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from "@/components/gac/fieldIcons";
import { GACButton } from "@/components/gac/gacButton";
import { GACCheckbox } from "@/components/gac/gacCheckbox";
import { GACInput } from "@/components/gac/gacInput";
import { loginUser } from "./actions";
import { initialLoginState } from "./loginState";

const iconClassName = "size-4 shrink-0 stroke-navy-input-text";
const toggleIconClassName =
  "size-4 stroke-navy-muted transition-colors group-hover:stroke-gold group-focus-visible:stroke-gold";

export const LoginForm = () => {
  const [state, formAction, pending] = useActionState(
    loginUser,
    initialLoginState,
  );
  const [showPassword, setShowPassword] = useState(false);

  const fieldErrors = state.status === "error" ? state.fieldErrors : {};
  const values =
    state.status === "error" ? state.values : { email: "", remember: false };

  const handleTogglePassword = () => setShowPassword((visible) => !visible);

  return (
    <>
      <form action={formAction} noValidate className="space-y-4">
        {state.status === "error" ? (
          <p
            role="alert"
            className="flex items-center gap-1.5 text-xs text-danger"
          >
            <ErrorIcon className="size-3.5 shrink-0 stroke-danger" />
            <span>{state.message}</span>
          </p>
        ) : null}

        <GACInput
          id="email"
          name="email"
          label="E-mail"
          icon={<EmailIcon className={iconClassName} />}
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          defaultValue={values.email}
          required
          error={fieldErrors.email}
        />

        <GACInput
          id="password"
          name="password"
          label="Senha"
          icon={<LockIcon className={iconClassName} />}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          error={fieldErrors.password}
          endAdornment={
            <button
              type="button"
              onClick={handleTogglePassword}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
              className="group grid shrink-0 cursor-pointer place-items-center rounded-md p-0.5 focus-visible:outline-none"
            >
              {showPassword ? (
                <EyeOffIcon className={toggleIconClassName} />
              ) : (
                <EyeIcon className={toggleIconClassName} />
              )}
            </button>
          }
        />

        <GACCheckbox
          name="remember"
          label="Lembrar de mim"
          defaultChecked={values.remember}
        />

        <GACButton type="submit" pending={pending} loadingText="Entrando…">
          Entrar
        </GACButton>
      </form>

      <p className="mt-6 text-center text-sm text-navy-muted">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="font-semibold text-gold transition hover:text-gold-light"
        >
          Criar conta
        </Link>
      </p>
    </>
  );
};
