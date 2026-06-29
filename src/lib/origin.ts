import { headers } from "next/headers";

/**
 * Détermine l'origine publique du site (ex: https://exemple.vercel.app) à
 * partir des en-têtes de la requête. Les liens traqués envoyés aux entreprises
 * utiliseront donc automatiquement le bon domaine, quel que soit l'endroit où
 * le tableau de bord est consulté. Repli sur NEXT_PUBLIC_SITE_URL.
 */
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto = h.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
