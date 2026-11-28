import "server-only";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "gac_session";

/**
 * Keeps the access token in an httpOnly cookie, so page scripts can never
 * read it. Without `maxAgeSeconds` it is a session cookie (gone when the
 * browser closes); with it, the cookie outlives the browser.
 */
export const startSession = async (
  accessToken: string,
  maxAgeSeconds?: number,
): Promise<void> => {
  const store = await cookies();
  store.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.SESSION_COOKIE_SECURE === "true",
    path: "/",
    maxAge: maxAgeSeconds,
  });
};

export const endSession = async (): Promise<void> => {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
};

export const readSessionToken = async (): Promise<string | undefined> => {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
};
