"use server";

import { randomUUID } from "node:crypto";
import { apiUrl } from "@/lib/api";
import type { RegisterField, RegisterState } from "./registerState";

type ApiError = {
  message?: string | string[];
  errors?: { field: string; message: string }[];
};

const FIELDS: readonly RegisterField[] = ["name", "email", "password"];

export const registerUser = async (
  _previous: RegisterState,
  formData: FormData,
): Promise<RegisterState> => {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const values = { name, email };

  let response: Response;
  try {
    response = await fetch(apiUrl("/auth/register"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-correlation-id": randomUUID(),
      },
      body: JSON.stringify({ name, email, password }),
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
    const user = (await response.json()) as { name: string; email: string };
    return { status: "success", user: { name: user.name, email: user.email } };
  }

  const body = (await response.json().catch(() => ({}))) as ApiError;
  const fieldErrors: Partial<Record<RegisterField, string>> = {};

  for (const error of body.errors ?? []) {
    const field = FIELDS.find((candidate) => candidate === error.field);
    if (field && !fieldErrors[field]) fieldErrors[field] = error.message;
  }

  if (response.status === 409) {
    fieldErrors.email = typeof body.message === "string"
      ? body.message
      : "Este e-mail já está cadastrado";
  }

  return {
    status: "error",
    message:
      response.status === 400 || response.status === 409
        ? "Revise os campos destacados."
        : "Algo deu errado ao criar sua conta. Tente novamente.",
    fieldErrors,
    values,
  };
};
