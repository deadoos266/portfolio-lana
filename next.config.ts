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
    // Autorise les images servies depuis Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kitkltjhslfrdsfopqac.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
