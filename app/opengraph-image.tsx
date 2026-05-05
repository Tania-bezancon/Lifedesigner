import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "lifedesigner — your life, redesigned with you.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f6f3ec",
          display: "flex",
          padding: "72px",
          position: "relative",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* coral halo top-right */}
        <div
          style={{
            position: "absolute",
            top: -150,
            right: -150,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 50%, rgba(225, 106, 79, 0.55) 0%, rgba(243, 166, 133, 0.25) 30%, rgba(243, 166, 133, 0.05) 60%, transparent 80%)",
            filter: "blur(20px)",
          }}
        />

        {/* small coral pip */}
        <div
          style={{
            position: "absolute",
            top: 76,
            left: 72,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, #f3a685, #e16a4f 70%)",
              boxShadow: "0 0 18px rgba(225, 106, 79, 0.5)",
            }}
          />
          <span style={{ fontSize: 22, color: "#5a564f", letterSpacing: "0.01em" }}>
            lifedesigner
          </span>
        </div>

        {/* headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 110,
              lineHeight: 1,
              letterSpacing: "-0.035em",
              color: "#1c1917",
              fontWeight: 500,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>your life,</div>
            <div style={{ color: "#5a564f", fontWeight: 400 }}>
              redesigned with you.
            </div>
          </div>

          <div
            style={{
              marginTop: 36,
              fontSize: 24,
              color: "#5a564f",
              maxWidth: 880,
              lineHeight: 1.4,
              letterSpacing: "-0.005em",
            }}
          >
            a concept interface for a voice-first life designer.
            twelve weeks. thirty-six small things. one quiet companion.
          </div>

          <div
            style={{
              marginTop: 32,
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 16,
              color: "#8a8478",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#e16a4f",
              }}
            />
            <span>concept · interface · by tania bezancon</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
