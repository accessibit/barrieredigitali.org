import { ImageResponse } from "next/og";

export const alt =
  "Barriere Digitali — Le barriere del web, segnalate da chi le incontra.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background: "#ffffff",
        color: "#111111",
        borderBottom: "24px solid #1f3fbf",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <svg width="88" height="88" viewBox="0 0 64 64">
          <rect width="64" height="64" rx="14" fill="#1f3fbf" />
          <rect x="14" y="20" width="5" height="30" rx="1.5" fill="#fff" />
          <rect x="45" y="20" width="5" height="30" rx="1.5" fill="#fff" />
          <rect x="9" y="23" width="46" height="11" rx="2" fill="#fff" />
          <path
            d="M16 23h7l-6 11h-7zM30 23h7l-6 11h-7zM44 23h7l-6 11h-7z"
            fill="#1f3fbf"
          />
        </svg>
        <div style={{ fontSize: 44, fontWeight: 700 }}>Barriere Digitali</div>
      </div>
      <div
        style={{
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
        }}
      >
        Le barriere del web, segnalate da chi le incontra.
      </div>
      <div style={{ fontSize: 32, color: "#545a64" }}>
        Siti, app e documenti digitali inaccessibili · barrieredigitali.org
      </div>
    </div>,
    size,
  );
}
