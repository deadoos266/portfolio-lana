import { cookies } from "next/headers";
import crypto from "node:crypto";

const COOKIE_NAME = "dash_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

/**
 * Jeton attendu dans le cookie : HMAC d'une constante avec le secret serveur.
 * Impossible à forger sans connaître DASHBOARD_SESSION_SECRET.
 */
function expectedToken(): string {
  const secret = process.env.DASHBOARD_SESSION_SECRET ?? "";
  return crypto
    .createHmac("sha256", secret)
    .update("authenticated")
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Vérifie le code à 4 chiffres saisi contre DASHBOARD_PIN. */
export function verifyPin(pin: string): boolean {
  const expected = process.env.DASHBOARD_PIN ?? "";
  if (!expected) return false;
  return safeEqual(pin, expected);
}

/** Ouvre une session (pose le cookie signé). */
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

/** Ferme la session. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Vrai si la requête courante a une session valide. */
export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return safeEqual(token, expectedToken());
}
