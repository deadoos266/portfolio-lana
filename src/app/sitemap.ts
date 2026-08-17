import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Plan du site remis à Google : l'accueil + une entrée par carte du
 * parcours. Généré depuis la base, donc une nouvelle carte y apparaît
 * automatiquement, sans intervention.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("parcours_cards")
    .select("slug, updated_at")
    .not("slug", "is", null)
    .order("display_order", { ascending: true });

  const cards = (data ?? []) as Array<{ slug: string; updated_at: string | null }>;

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...cards.map((c) => ({
      url: `${SITE_URL}/parcours/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
