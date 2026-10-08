import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1f3fbf",
      }}
    >
      <svg width="120" height="120" viewBox="0 0 64 64">
        <rect x="14" y="20" width="5" height="30" rx="1.5" fill="#fff" />
        <rect x="45" y="20" width="5" height="30" rx="1.5" fill="#fff" />
        <rect x="9" y="23" width="46" height="11" rx="2" fill="#fff" />
        <path
          d="M16 23h7l-6 11h-7zM30 23h7l-6 11h-7zM44 23h7l-6 11h-7z"
          fill="#1f3fbf"
        />
      </svg>
    </div>,
    size,
  );
}
