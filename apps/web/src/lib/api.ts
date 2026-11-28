import "server-only";

/**
 * Base URL of the Nest API as seen from the Next.js server (Server Actions
 * run there). In Docker Compose it is the internal `http://api:3001`;
 * locally it falls back to the public URL.
 */
export const apiUrl = (path: string): string => {
  const base =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001";
  return new URL(path, base).toString();
};
