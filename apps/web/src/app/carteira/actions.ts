"use server";

import { redirect } from "next/navigation";
import { endSession } from "@/lib/session";

export const logout = async (): Promise<void> => {
  await endSession();
  redirect("/login");
};
