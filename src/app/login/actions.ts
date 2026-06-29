"use server";

import { redirect } from "next/navigation";
import { verifyPin, createSession } from "@/lib/auth";

export interface LoginState {
  error: string;
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const pin = String(formData.get("pin") ?? "").trim();

  if (!(await verifyPin(pin))) {
    return { error: "Code incorrect." };
  }

  await createSession();
  redirect("/dashboard");
}
