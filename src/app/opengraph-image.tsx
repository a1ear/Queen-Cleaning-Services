import { ImageResponse } from "next/og";
import { siteConfig } from "@/site.config";

const { business: b } = siteConfig;

export const alt = `${b.name}: ${b.description}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at build time from the site config, so it always shows the real name.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: 80, background: "linear-gradient(135deg, #e6f4f2 0%, #f6faf9 60%)", color: "#0d2633",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "#0b7a75", display: "flex" }} />
          <div style={{ fontSize: 40, fontWeight: 700 }}>{b.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 1.05 }}>{b.headline[0]}</div>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 1.05, color: "#0b7a75" }}>{b.headline[1]}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30 }}>
          <div style={{ color: "#33505e" }}>{b.phone}</div>
          <div style={{ background: "#ffd166", padding: "16px 32px", borderRadius: 40, fontWeight: 700 }}>Request a Quote</div>
        </div>
      </div>
    ),
    size,
  );
}
