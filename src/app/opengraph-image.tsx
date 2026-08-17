import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Portfolio de Lana Hervé, journaliste";

/**
 * Carte de partage (aperçu affiché quand le lien est envoyé sur WhatsApp,
 * LinkedIn, etc.), aux couleurs du portfolio : fond crème, bordeaux.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FBF9F4",
          position: "relative",
        }}
      >
        {/* Filet bordeaux en haut, rappel du liseré des cadres du site */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: "#6A2020",
          }}
        />
        <div
          style={{
            fontSize: 30,
            letterSpacing: 18,
            color: "#8a6a52",
            textTransform: "uppercase",
          }}
        >
          Portfolio
        </div>
        <div
          style={{
            fontSize: 118,
            fontWeight: 700,
            color: "#6A2020",
            marginTop: 12,
          }}
        >
          Lana Hervé
        </div>
        <div style={{ fontSize: 34, color: "#3F3F46", marginTop: 18 }}>
          Journaliste, spécialisation presse magazine
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 12,
            background: "#6A2020",
          }}
        />
      </div>
    ),
    size,
  );
}
