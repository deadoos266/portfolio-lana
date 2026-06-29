"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPin, createSession } from "@/lib/auth";
import { minutesLocked, registerFail, clearFails } from "@/lib/rate-limit";

export interface LoginState {
  error: string;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip = await clientIp();

  const locked = await minutesLocked(ip);
  if (locked) {
    return {
      error: `Trop de tentatives. Réessaie dans ${locked} min.`,
    };
  }

  const pin = String(formData.get("pin") ?? "").trim();

  if (!(await verifyPin(pin))) {
    await registerFail(ip);
    return { error: "Code incorrect." };
  }

  await clearFails(ip);
  await createSession();
  redirect("/dashboard");
}
