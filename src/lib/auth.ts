import { cookies } from "next/headers";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const COOKIE_NAME = "dash_session";
const MAX_AGE = 60 * 60 * 24 * 400; // ~400 jours (max navigateur) — reste connecté
const PIN_KEY = "dashboard_pin_hash";

function secret(): string {
  return process.env.DASHBOARD_SESSION_SECRET ?? "";
}

/** HMAC-SHA256 d'un message avec le secret serveur. */
function hmac(message: string): string {
  return crypto.createHmac("sha256", secret()).update(message).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function expectedToken(): string {
  return hmac("authenticated");
}

// --- Code d'accès (stocké haché en base, donc modifiable depuis le dashboard) ---

async function getStoredPinHash(): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", PIN_KEY)
    .maybeSingle();
  return data?.value ?? null;
}

/** Le code saisi correspond-il au code enregistré ? */
export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await getStoredPinHash();
  if (!stored) return false;
  return safeEqual(hmac(pin), stored);
}

/** Le format est-il valide (exactement 6 chiffres) ? */
export function isValidPinFormat(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

/** Enregistre un nouveau code (haché). */
export async function setPin(newPin: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("app_settings").upsert({
    key: PIN_KEY,
    value: hmac(newPin),
    updated_at: new Date().toISOString(),
  });
}

// --- Session (cookie signé) ---

export async function createSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return safeEqual(token, expectedToken());
}
