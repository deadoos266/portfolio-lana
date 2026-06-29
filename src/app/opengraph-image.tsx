import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lana Hervé — Journaliste";

// Carte de partage neutre (Lana pourra la restyler plus tard).
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
          background: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 36,
            letterSpacing: 16,
            color: "#a1a1aa",
            textTransform: "uppercase",
          }}
        >
          Portfolio
        </div>
        <div style={{ fontSize: 120, fontWeight: 700, color: "#18181b" }}>
          Lana Hervé
        </div>
        <div style={{ fontSize: 40, color: "#52525b", marginTop: 8 }}>
          Journaliste
        </div>
      </div>
    ),
    size,
  );
}
