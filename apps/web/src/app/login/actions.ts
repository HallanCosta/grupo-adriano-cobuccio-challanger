"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { startSession } from "@/lib/session";
import type { LoginField, LoginState } from "./loginState";

type ApiError = {
  message?: string | string[];
  errors?: { field: string; message: string }[];
};

type ApiSession = {
  accessToken: string;
  expiresIn: number;
};

const FIELDS: readonly LoginField[] = ["email", "password"];

export const loginUser = async (
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> => {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";
  const values = { email, remember };

  let response: Response;
  try {
    response = await fetch(apiUrl("/auth/login"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-correlation-id": randomUUID(),
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return {
      status: "error",
      message: "Não foi possível falar com a API. Tente novamente.",
      fieldErrors: {},
      values,
    };
  }

  if (response.ok) {
    const session = (await response.json()) as ApiSession;
    await startSession(
      session.accessToken,
      remember ? session.expiresIn : undefined,
    );
    redirect("/carteira");
  }

  const body = (await response.json().catch(() => ({}))) as ApiError;
  const fieldErrors: Partial<Record<LoginField, string>> = {};

  for (const error of body.errors ?? []) {
    const field = FIELDS.find((candidate) => candidate === error.field);
    if (field && !fieldErrors[field]) fieldErrors[field] = error.message;
  }

  return {
    status: "error",
    message: messageFor(response.status, body),
    fieldErrors,
    values,
  };
};

const messageFor = (status: number, body: ApiError): string => {
  if (status === 401) {
    return typeof body.message === "string"
      ? body.message
      : "E-mail ou senha inválidos";
  }
  if (status === 400) return "Revise os campos destacados.";
  return "Algo deu errado ao entrar. Tente novamente.";
};
