import { NextRequest, NextResponse, userAgent } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function decodeHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Enregistre une visite "normale" du site public (déclenchée par le composant
 * VisitTracker). La requête venant du navigateur du visiteur, Vercel y ajoute
 * sa géolocalisation.
 */
export async function POST(request: NextRequest) {
  let body: { path?: string; referrer?: string | null } = {};
  try {
    body = await request.json();
  } catch {
    // corps vide / invalide -> on garde les valeurs par défaut
  }

  const path =
    typeof body.path === "string" && body.path ? body.path.slice(0, 512) : "/";
  const referrer =
    typeof body.referrer === "string" && body.referrer
      ? body.referrer.slice(0, 512)
      : null;

  const ua = userAgent(request);
  const h = request.headers;
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    null;

  const supabase = createAdminClient();
  await supabase.from("page_visits").insert({
    path,
    referrer,
    ip,
    country: h.get("x-vercel-ip-country"),
    city: decodeHeader(h.get("x-vercel-ip-city")),
    user_agent: ua.ua || null,
    device_type: ua.device.type ?? "desktop",
    browser: ua.browser.name ?? null,
    os: ua.os.name ?? null,
  });

  return new NextResponse(null, { status: 204 });
}
