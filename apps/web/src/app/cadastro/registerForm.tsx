"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { GACButton } from "@/components/gac/gacButton";
import { ErrorIcon } from "@/components/gac/errorIcon";
import { GACInput } from "@/components/gac/gacInput";
import { registerUser } from "./actions";
import { EmailIcon, LockIcon, UserIcon } from "./fieldIcons";
import { initialRegisterState } from "./registerState";
import { RegisterSuccess } from "./registerSuccess";

const SHORT_PASSWORD_MESSAGE = "A senha deve ter pelo menos 8 caracteres";

const iconClassName = "size-4 shrink-0 stroke-navy-input-text";

export const RegisterForm = () => {
  const [state, formAction, pending] = useActionState(
    registerUser,
    initialRegisterState,
  );
  const [passwordEdited, setPasswordEdited] = useState(false);
  const [passwordLength, setPasswordLength] = useState(0);

  if (state.status === "success") {
    return <RegisterSuccess name={state.user.name} email={state.user.email} />;
  }

  const fieldErrors = state.status === "error" ? state.fieldErrors : {};
  const values =
    state.status === "error" ? state.values : { name: "", email: "" };
  const clientPasswordError =
    passwordEdited && passwordLength < 8
      ? SHORT_PASSWORD_MESSAGE
      : undefined;
  const passwordError = fieldErrors.password ?? clientPasswordError;

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPasswordEdited(true);
    setPasswordLength(event.target.value.length);
  };

  return (
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
        id="name"
        name="name"
        label="Nome"
        icon={<UserIcon className={iconClassName} />}
        autoComplete="name"
        placeholder="Seu nome"
        defaultValue={values.name}
        required
        maxLength={100}
        error={fieldErrors.name}
      />

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
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        error={passwordError}
        onChange={handlePasswordChange}
      />

      <GACButton
        type="submit"
        pending={pending}
        loadingText="Criando conta…"
      >
        Criar conta
      </GACButton>
    </form>
  );
};
