export type RegisterField = "name" | "email" | "password";

export type RegisterState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors: Partial<Record<RegisterField, string>>;
      values: { name: string; email: string };
    }
  | { status: "success"; user: { name: string; email: string } };

export const initialRegisterState: RegisterState = { status: "idle" };
