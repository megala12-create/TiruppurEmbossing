import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = `${site.name} | ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social card, generated at build time from the supplied logo. */
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/assets/brand/logo-mark.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const bar = ["#017486", "#008D9B", "#FBB03C", "#F77E1E", "#C81C24", "#8F202C"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#16161a",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", width: 104, height: 104, background: "#ffffff", alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={90} height={90} alt="" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 30, fontWeight: 700, letterSpacing: 2, lineHeight: 1 }}>
            <span>TIRUPPUR</span>
            <span>EMBOSSING</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 96, fontWeight: 800, lineHeight: 0.92, letterSpacing: -2 }}>
          <span>PRINTING INNOVATION</span>
          <span style={{ display: "flex", gap: 24 }}>
            AT ITS <span style={{ color: "#C81C24" }}>FINEST</span>
          </span>
        </div>
        <div style={{ display: "flex", width: "100%", height: 12 }}>
          {bar.map((c) => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
