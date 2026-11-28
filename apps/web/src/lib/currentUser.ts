import "server-only";
import { apiUrl } from "@/lib/api";
import { readSessionToken } from "@/lib/session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

/**
 * Asks the API who the session cookie belongs to. Returns `null` when there
 * is no session or the API no longer accepts the token.
 */
export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const token = await readSessionToken();
  if (!token) return null;

  const response = await fetch(apiUrl("/auth/me"), {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 401) return null;
  if (!response.ok) {
    throw new Error(`Falha ao consultar a sessão (HTTP ${response.status})`);
  }

  return (await response.json()) as CurrentUser;
};
