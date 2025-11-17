import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get("title") || "Median News";
  const bias = searchParams.get("bias") || "Center";

  const colors = {
    Left: "#3366FF",
    Center: "#D1D5DB",
    Right: "#FF3B3B",
  };

  return new ImageResponse(
    <div
      style={{
          fontSize: 60,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "8px",
              background: "#1E293B",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: "bold",
            }}
          >
            M
          </div>
          <div style={{ fontSize: "40px", fontWeight: "bold" }}>Median News</div>
        </div>
        <div
          style={{
            fontSize: "48px",
            fontWeight: "600",
            textAlign: "center",
            marginBottom: "40px",
            maxWidth: "1000px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            padding: "20px 40px",
            borderRadius: "12px",
            background: colors[bias as keyof typeof colors] || colors.Center,
            color: bias === "Center" ? "#1E293B" : "white",
            fontSize: "32px",
            fontWeight: "600",
          }}
        >
          {bias} Bias
        </div>
      </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}



