import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * Autorise l'indexation du site public, mais garde hors des moteurs le
 * dashboard, la connexion et les liens traqués (pages privées ou de
 * redirection, qui n'ont rien à faire dans les résultats de recherche).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/dashboard/", "/login", "/api/", "/l/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
