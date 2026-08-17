import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Favicon du site : monogramme « LH » crème sur fond bordeaux, aux couleurs
 * du portfolio. Remplace l'icône Next.js par défaut (le triangle).
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#6A2020",
          color: "#FBF9F4",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: -1,
          borderRadius: 14,
        }}
      >
        LH
      </div>
    ),
    size,
  );
}
