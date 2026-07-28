import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ToyCompany — Buy Kids Toys Online in Pakistan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "linear-gradient(135deg, #e8f6fb 0%, #f7fafc 45%, #fff4ec 100%)",
          color: "#123047",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: "-0.04em",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "rgba(26,166,193,0.15)",
              border: "2px solid rgba(26,166,193,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1aa6c1",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            TC
          </div>
          <span>
            Toy <span style={{ color: "#1aa6c1" }}>Company</span>
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 58,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              maxWidth: 920,
            }}
          >
            Pakistan&apos;s Favourite Online Toy Store
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(18,48,71,0.72)",
              maxWidth: 820,
              lineHeight: 1.35,
            }}
          >
            Kids toys, diecast, RC cars, baby gear &amp; pools — COD nationwide
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
