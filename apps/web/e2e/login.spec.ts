import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

const API_URL = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:3001";
const SESSION_COOKIE = "gac_session";
const PASSWORD = "s3nha-forte";
const INVALID_CREDENTIALS_MESSAGE = "E-mail ou senha inválidos";

const uniqueEmail = () => `e2e.login.${Date.now()}.${randomUUID()}@example.com`;

const registerViaApi = async (
  request: APIRequestContext,
  user: { name: string; email: string },
) => {
  const response = await request.post(`${API_URL}/auth/register`, {
    data: { ...user, password: PASSWORD },
  });
  expect(response.status()).toBe(201);
};

const fillLoginForm = async (
  page: Page,
  fields: { email?: string; password?: string },
) => {
  if (fields.email !== undefined) {
    await page.getByLabel("E-mail").fill(fields.email);
  }
  if (fields.password !== undefined) {
    await page.getByLabel("Senha", { exact: true }).fill(fields.password);
  }
};

const submitLogin = async (page: Page) => {
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
};

const alertWithText = (page: Page, message: string) =>
  page.getByRole("alert").filter({ hasText: message });

const sessionCookie = async (page: Page) =>
  (await page.context().cookies()).find(
    (cookie) => cookie.name === SESSION_COOKIE,
  );

test.describe("login page", () => {
  const name = "Maria Silva";
  let email: string;

  test.beforeEach(async ({ page, request }) => {
    email = uniqueEmail();
    await registerViaApi(request, { name, email });
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  });

  test("signs in and lands on the protected wallet page", async ({ page }) => {
    await fillLoginForm(page, { email, password: PASSWORD });
    await submitLogin(page);

    await page.waitForURL("**/carteira");
    await expect(page.getByText(`Olá, ${name}!`)).toBeVisible();
    await expect(page.getByText(`Você entrou como ${email}.`)).toBeVisible();
  });

  test("keeps the session token in an httpOnly cookie", async ({ page }) => {
    await fillLoginForm(page, { email, password: PASSWORD });
    await submitLogin(page);
    await page.waitForURL("**/carteira");

    const cookie = await sessionCookie(page);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");
    expect(await page.evaluate(() => document.cookie)).not.toContain(
      SESSION_COOKIE,
    );
  });

  test("makes the cookie persistent only when \"Lembrar de mim\" is checked", async ({
    page,
  }) => {
    await fillLoginForm(page, { email, password: PASSWORD });
    await submitLogin(page);
    await page.waitForURL("**/carteira");
    expect((await sessionCookie(page))?.expires).toBe(-1);

    await page.context().clearCookies();
    await page.goto("/login");
    await fillLoginForm(page, { email, password: PASSWORD });
    await page.getByLabel("Lembrar de mim").check();
    await submitLogin(page);
    await page.waitForURL("**/carteira");
    expect((await sessionCookie(page))?.expires).toBeGreaterThan(Date.now() / 1000);
  });

  test("shows the invalid credentials error for a wrong password", async ({
    page,
  }) => {
    await fillLoginForm(page, { email, password: "senha-errada" });
    await submitLogin(page);

    await expect(
      alertWithText(page, INVALID_CREDENTIALS_MESSAGE),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel("E-mail")).toHaveValue(email);
    expect(await sessionCookie(page)).toBeUndefined();
  });

  test("shows the same error for an email that is not registered", async ({
    page,
  }) => {
    await fillLoginForm(page, { email: uniqueEmail(), password: PASSWORD });
    await submitLogin(page);

    await expect(
      alertWithText(page, INVALID_CREDENTIALS_MESSAGE),
    ).toBeVisible({ timeout: 15_000 });
    expect(await sessionCookie(page)).toBeUndefined();
  });

  test("shows a field error for each empty field", async ({ page }) => {
    await submitLogin(page);

    await expect(
      alertWithText(page, "Revise os campos destacados."),
    ).toBeVisible({ timeout: 15_000 });
    await expect(alertWithText(page, "Informe o e-mail")).toBeVisible();
    await expect(alertWithText(page, "Informe a senha")).toBeVisible();
  });

  test("shows a field error for an invalid email", async ({ page }) => {
    await fillLoginForm(page, { email: "not-an-email", password: PASSWORD });
    await submitLogin(page);

    await expect(alertWithText(page, "E-mail inválido")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/login$/);
  });

  test("toggles the password visibility", async ({ page }) => {
    const password = page.getByLabel("Senha", { exact: true });
    await password.fill(PASSWORD);
    await expect(password).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "Mostrar senha" }).click();
    await expect(password).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: "Ocultar senha" }).click();
    await expect(password).toHaveAttribute("type", "password");
  });

  test("links to the registration page", async ({ page }) => {
    await page.getByRole("link", { name: "Criar conta" }).click();

    await expect(page).toHaveURL(/\/cadastro$/);
    await expect(
      page.getByRole("heading", { name: "Criar conta" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("signs out and drops the session", async ({ page }) => {
    await fillLoginForm(page, { email, password: PASSWORD });
    await submitLogin(page);
    await page.waitForURL("**/carteira");

    await page.getByRole("button", { name: "Sair" }).click();

    await page.waitForURL("**/login");
    expect(await sessionCookie(page)).toBeUndefined();
    await page.goto("/carteira");
    await page.waitForURL("**/login");
  });
});

test.describe("protected wallet page", () => {
  test("sends visitors without a session to the login page", async ({
    page,
  }) => {
    await page.goto("/carteira");

    await page.waitForURL("**/login");
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  });

  test("sends visitors with a forged token to the login page", async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([
      {
        name: SESSION_COOKIE,
        value: "not-a-real-token",
        url: baseURL ?? "http://localhost:3000",
        httpOnly: true,
      },
    ]);

    await page.goto("/carteira");

    await page.waitForURL("**/login");
  });
});
