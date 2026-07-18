import { ImageResponse } from "next/og";
import { socialImageSize } from "@/app/(features)/seo/social-image-config";
import { siteConfig } from "@/lib/site-config";

type SocialImageOptions = {
  title?: string;
  description?: string;
  label?: string;
  pathname?: string;
  status?: "beta" | "experimental";
};

function ControlUiMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 79 71" width="51" height="46">
      <rect x="0" y="0" width="79" height="31" rx="8" fill="rgb(250, 250, 250)" />
      <rect x="31" y="4" width="44" height="23" rx="5" fill="rgb(15, 15, 18)" />
      <rect x="0" y="40" width="79" height="31" rx="8" fill="rgb(250, 250, 250)" />
      <rect x="4" y="44" width="71" height="23" rx="5" fill="rgb(15, 15, 18)" />
      <rect x="14" y="47" width="4" height="17" rx="2" fill="rgb(250, 250, 250)" />
    </svg>
  );
}

function titleFontSize(title: string) {
  if (title.length > 36) return 62;
  if (title.length > 26) return 68;
  if (title.length > 18) return 74;
  return 82;
}

// next/og's Satori renderer does not support oklch(), so metadata images use equivalent RGB colors.
export function renderSocialImage({
  title = "React components for AI interfaces",
  description = siteConfig.description,
  label = "Open-source UI registry",
  pathname = "",
  status,
}: SocialImageOptions = {}) {
  const route = pathname ? `${siteConfig.registry.name}${pathname}` : siteConfig.registry.name;

  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "linear-gradient(135deg, rgb(10, 10, 12) 0%, rgb(18, 18, 24) 100%)",
        color: "rgb(250, 250, 250)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        height: "100%",
        justifyContent: "space-between",
        overflow: "hidden",
        padding: "64px 72px 56px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "radial-gradient(circle, rgba(102, 117, 255, 0.28) 0%, rgba(102, 117, 255, 0) 70%)",
          display: "flex",
          height: 520,
          position: "absolute",
          right: -115,
          top: -235,
          width: 520,
        }}
      />
      <div
        style={{
          border: "1px solid rgba(250, 250, 250, 0.08)",
          borderRadius: 30,
          bottom: 24,
          display: "flex",
          left: 24,
          position: "absolute",
          right: 24,
          top: 24,
        }}
      />

      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
        <div style={{ alignItems: "center", display: "flex" }}>
          <ControlUiMark />
          <div style={{ display: "flex", fontSize: 28, fontWeight: 650, letterSpacing: "-0.035em", marginLeft: 18 }}>Control UI</div>
        </div>
        <div
          style={{
            alignItems: "center",
            border: "1px solid rgba(250, 250, 250, 0.12)",
            borderRadius: 999,
            color: "rgb(190, 192, 204)",
            display: "flex",
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "0.12em",
            padding: "11px 17px",
            textTransform: "uppercase",
          }}
        >
          shadcn registry
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 1010, position: "relative" }}>
        <div style={{ alignItems: "center", display: "flex", marginBottom: 22 }}>
          <div
            style={{
              color: "rgb(145, 158, 255)",
              display: "flex",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
          {status ? (
            <div
              style={{
                background: "rgba(145, 158, 255, 0.12)",
                border: "1px solid rgba(145, 158, 255, 0.3)",
                borderRadius: 999,
                color: "rgb(181, 190, 255)",
                display: "flex",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.1em",
                marginLeft: 16,
                padding: "7px 11px",
                textTransform: "uppercase",
              }}
            >
              {status}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleFontSize(title),
            fontWeight: 700,
            letterSpacing: "-0.06em",
            lineHeight: 0.98,
            maxWidth: 1040,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "rgb(181, 182, 193)",
            display: "flex",
            fontSize: 25,
            lineHeight: 1.35,
            marginTop: 24,
            maxWidth: 1030,
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          borderTop: "1px solid rgba(250, 250, 250, 0.1)",
          color: "rgb(143, 144, 156)",
          display: "flex",
          fontSize: 17,
          justifyContent: "space-between",
          letterSpacing: "0.04em",
          paddingTop: 22,
          width: "100%",
        }}
      >
        <div style={{ display: "flex" }}>SHADCN-COMPATIBLE · EDITABLE SOURCE</div>
        <div style={{ color: "rgb(178, 184, 255)", display: "flex" }}>{route}</div>
      </div>
    </div>,
    socialImageSize,
  );
}

export function renderIcon(size: number) {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "rgb(20, 20, 24)",
        color: "rgb(250, 250, 250)",
        display: "flex",
        fontSize: size * 0.54,
        fontWeight: 700,
        height: "100%",
        justifyContent: "center",
        letterSpacing: "-0.08em",
        width: "100%",
      }}
    >
      C
    </div>,
    { width: size, height: size },
  );
}
