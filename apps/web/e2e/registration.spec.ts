import { expect, test, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

const VALID_PASSWORD = "s3nha-forte";
const SHORT_PASSWORD_MESSAGE = "A senha deve ter pelo menos 8 caracteres";

const uniqueEmail = () =>
  `e2e.cadastro.${Date.now()}.${randomUUID()}@example.com`;

const fillRegistrationForm = async (
  page: Page,
  fields: { name?: string; email?: string; password?: string },
) => {
  if (fields.name !== undefined) {
    await page.getByLabel("Nome").fill(fields.name);
  }
  if (fields.email !== undefined) {
    await page.getByLabel("E-mail").fill(fields.email);
  }
  if (fields.password !== undefined) {
    await page.getByLabel("Senha").fill(fields.password);
  }
};

const submitRegistration = async (page: Page) => {
  await page.getByRole("button", { name: "Criar conta" }).click();
};

const alertWithText = (page: Page, message: string) =>
  page.getByRole("alert").filter({ hasText: message });

test.describe("registration page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cadastro");
    await expect(
      page.getByRole("heading", { name: "Criar conta" }),
    ).toBeVisible();
  });

  test("creates an account and shows the success state", async ({ page }) => {
    const name = "Maria Silva";
    const email = uniqueEmail();

    await fillRegistrationForm(page, {
      name,
      email,
      password: VALID_PASSWORD,
    });
    await submitRegistration(page);

    const success = page.getByRole("status");
    await expect(success).toBeVisible({ timeout: 15_000 });
    await expect(success).toContainText(`Conta criada, ${name}!`);
    await expect(success).toContainText(
      `Sua carteira foi aberta com saldo R$ 0,00 para ${email}.`,
    );
    await expect(
      page.getByRole("link", { name: "Voltar ao início" }),
    ).toHaveAttribute("href", "/");
  });

  test("shows a client-side error when the password is too short", async ({
    page,
  }) => {
    await fillRegistrationForm(page, { password: "short" });

    await expect(
      alertWithText(page, SHORT_PASSWORD_MESSAGE),
    ).toBeVisible();
  });

  test("shows server validation errors on each field", async ({ page }) => {
    await submitRegistration(page);

    await expect(
      alertWithText(page, "Revise os campos destacados."),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      alertWithText(page, "Informe o nome"),
    ).toBeVisible();
    await expect(
      alertWithText(page, "E-mail inválido"),
    ).toBeVisible();
    await expect(
      alertWithText(page, SHORT_PASSWORD_MESSAGE),
    ).toBeVisible();
  });

  test("shows a field error for an invalid email", async ({ page }) => {
    await fillRegistrationForm(page, {
      name: "Maria Silva",
      email: "not-an-email",
      password: VALID_PASSWORD,
    });
    await submitRegistration(page);

    await expect(
      alertWithText(page, "Revise os campos destacados."),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      alertWithText(page, "E-mail inválido"),
    ).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(0);
  });

  test("shows the API error when the email is already registered", async ({
    page,
  }) => {
    const name = "Maria Silva";
    const email = uniqueEmail();

    await fillRegistrationForm(page, {
      name,
      email,
      password: VALID_PASSWORD,
    });
    await submitRegistration(page);
    await expect(page.getByRole("status")).toBeVisible({ timeout: 15_000 });

    await page.goto("/cadastro");
    await fillRegistrationForm(page, {
      name,
      email,
      password: VALID_PASSWORD,
    });
    await submitRegistration(page);

    await expect(
      alertWithText(page, "Revise os campos destacados."),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      alertWithText(page, "Este e-mail já está cadastrado"),
    ).toBeVisible();
  });
});
