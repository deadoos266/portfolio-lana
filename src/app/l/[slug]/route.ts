import { NextRequest, NextResponse, userAgent } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Toujours exécuté dynamiquement (jamais mis en cache) : chaque visite compte.
export const dynamic = "force-dynamic";

function decodeVercelHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: link } = await supabase
    .from("tracked_links")
    .select("id, destination_url, is_active")
    .eq("slug", slug)
    .maybeSingle();

  if (!link || !link.is_active) {
    return new NextResponse("Lien introuvable ou désactivé.", { status: 404 });
  }

  // Infos de l'ouverture (géolocalisation fournie gratuitement par Vercel).
  const ua = userAgent(request);
  const h = request.headers;
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    null;

  // On attend l'écriture avant de rediriger (l'exécution serverless peut
  // s'arrêter dès la réponse renvoyée).
  await supabase.from("link_opens").insert({
    link_id: link.id,
    ip,
    country: h.get("x-vercel-ip-country"),
    city: decodeVercelHeader(h.get("x-vercel-ip-city")),
    user_agent: ua.ua || null,
    device_type: ua.device.type ?? "desktop",
    browser: ua.browser.name ?? null,
    os: ua.os.name ?? null,
    referrer: h.get("referer"),
  });

  return NextResponse.redirect(link.destination_url, 302);
}
