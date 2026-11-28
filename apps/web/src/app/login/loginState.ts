export type LoginField = "email" | "password";

export type LoginState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors: Partial<Record<LoginField, string>>;
      values: { email: string; remember: boolean };
    };

export const initialLoginState: LoginState = { status: "idle" };
