import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import { DocsShell } from "@/app/(features)/client/client";
import { getDocsShellData } from "@/app/(features)/model/data";
import { SiteStructuredData, siteMetadata } from "@/app/(features)/seo/seo";
import { getControlUiGitHubStars } from "@/app/(features)/sidebar/github-stars";
import { ThemeFavicon } from "@/app/(features)/theme/favicon-client";
import { ControlEffectsRuntime } from "@/components/control-ui/extensions/control-effects-root";
import { cn } from "@/components/control-ui/lib/cn";
import { DEFAULT_SKIN_ID, THEME_INIT_SCRIPT } from "@/components/theme";
import { ThemeRuntimeProvider } from "@/components/theme-drawer/theme-runtime-context";
import { SkinEpochBoundary, ThemeDrawerProvider } from "@/components/theme-drawer-context";
import { LiquidMetalSkinRuntime } from "@/src/registry/skin-packs/liquid-metal/liquid-metal-runtime";
import { ModernAppleLiquidGlassRuntime } from "@/src/registry/skin-packs/modern-apple/modern-apple-liquid-glass-runtime";
import "./globals.css";

export const metadata: Metadata = siteMetadata;

// next/font self-hosts geist, fills --font-geist-sans; theme.css's --font-sans consumes it first, falls to system stack when app shell absent.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
// Same contract for the linear pack's face: it reads --font-inter, falling back to the system stack when the shell doesn't provide it.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export default async function RootLayout({ children }: { children: ReactNode }) {
  const githubStars = await getControlUiGitHubStars();
  return (
    <html lang="en" data-skin={DEFAULT_SKIN_ID} suppressHydrationWarning className={cn(geist.variable, inter.variable)}>
      <body>
        <ThemeFavicon />
        <SiteStructuredData />
        <Script id="control-ui-theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeDrawerProvider>
          <ThemeRuntimeProvider>
            <div data-skin-scope="docs">
              {/* Inside the boundary: epoch remount is the only thing that re-resolves mutated skin config past React Compiler's memoization. */}
              <SkinEpochBoundary>
                <DocsShell {...getDocsShellData()} githubStars={githubStars}>
                  {children}
                </DocsShell>
                {/* Mirrors ControlUiSkin.effects onto <html> for the ripple listener; inside the boundary for the same remount reason. */}
                <ControlEffectsRuntime />
              </SkinEpochBoundary>
            </div>
          </ThemeRuntimeProvider>
        </ThemeDrawerProvider>
        <ModernAppleLiquidGlassRuntime />
        <LiquidMetalSkinRuntime />
      </body>
    </html>
  );
}
