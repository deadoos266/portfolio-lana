import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Racine du projet explicite (évite l'avertissement de lockfile dû à OneDrive)
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Permet l'upload de gros fichiers (photomaton, CV, images) via les Server Actions.
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  images: {
    // Autorise Supabase Storage + n'importe quelle image externe pour les
    // aperçus d'articles (Open Graph). On accepte tous les domaines HTTPS.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kitkltjhslfrdsfopqac.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
