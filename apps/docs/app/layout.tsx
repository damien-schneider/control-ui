import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { DocsShell } from "@/app/(features)/client/client";
import { getDocsShellData } from "@/app/(features)/model/data";
import { SiteStructuredData, siteMetadata } from "@/app/(features)/seo/seo";
import { getControlUiGitHubStars } from "@/app/(features)/sidebar/github-stars";
import { ThemeFavicon } from "@/app/(features)/theme/favicon-client";
import themeInitScript from "@/app/(features)/theme/generated-theme-init.json";
import { cn } from "@/components/control-ui/lib/cn";
import { DEFAULT_SKIN_ID } from "@/components/theme";
import { SkinRuntimeEffects } from "@/components/theme-drawer/skin-runtime-effects";
import { ThemeRuntimeProvider } from "@/components/theme-drawer/theme-runtime-context";
import { ModernAppleGlassFilter } from "@/src/registry/skin-packs/modern-apple/modern-apple-glass-filter";
import "./globals.css";

export const metadata: Metadata = siteMetadata;

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export default async function RootLayout({ children }: { children: ReactNode }) {
  const githubStars = await getControlUiGitHubStars();
  return (
    <html lang="en" data-skin={DEFAULT_SKIN_ID} suppressHydrationWarning className={cn(geist.variable, inter.variable)}>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Static build output must execute before the first paint. */}
        <script id="control-ui-theme-init" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <SiteStructuredData />
        <ThemeFavicon />

        <ThemeRuntimeProvider>
          <div data-skin-scope="docs">
            <DocsShell {...getDocsShellData()} githubStars={githubStars}>
              {children}
            </DocsShell>
          </div>
          <SkinRuntimeEffects />
        </ThemeRuntimeProvider>

        <ModernAppleGlassFilter />
      </body>
    </html>
  );
}
