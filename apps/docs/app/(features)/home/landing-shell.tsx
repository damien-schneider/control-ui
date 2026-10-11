"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ControlUiLogo } from "@/app/(features)/brand/control-ui-logo";
import { catalogOverview } from "@/app/(features)/catalog/overviews";
import { skinsOverviewId } from "@/app/(features)/catalog/skins";
import { DocsGithubLink } from "@/app/(features)/client/github-link";
import type { SearchItem } from "@/app/(features)/model/types";
import { DocsSearchProvider, DocsSearchTrigger } from "@/app/(features)/sidebar/search";
import { cn } from "@/components/control-ui/lib/cn";
import { AppShellHeader } from "@/components/control-ui/ui/app-shell";
import { Badge } from "@/components/control-ui/ui/badge";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { Text } from "@/components/control-ui/ui/typography";
import { ThemeModeSwitch } from "@/components/theme-toggle";
import { siteConfig } from "@/lib/site-config";
import { landingWidthClassName } from "./showcase";
import { SkinPicker } from "./skin-picker";

const navLinks = [
  { href: "/get-started", label: "Docs" },
  { href: catalogOverview("components").href, label: "Components" },
  { href: catalogOverview("kits").href, label: "Kits" },
  { href: catalogOverview("templates").href, label: "Templates" },
  { href: `/${skinsOverviewId}`, label: "Skins" },
];

function LandingHeader({ githubStars }: { githubStars: number | null }) {
  return (
    <AppShellHeader
      className="flex-col items-stretch gap-0"
      style={{ "--cui-app-shell-header-padding-inline": "0px", "--cui-app-shell-header-background": "var(--canvas)" }}
    >
      <div className={cn(landingWidthClassName, "flex h-14 items-center gap-6")}>
        <div className="relative flex shrink-0 items-center">
          <Link href="/" className="flex items-center gap-1.5">
            <ControlUiLogo />
            <Text size="heading-4" tone="foreground" className="leading-none">
              control.ui
            </Text>
          </Link>
          <Badge size="sm" className="absolute -top-1 left-full ml-1">
            alpha
          </Badge>
        </div>
        <nav aria-label="Main" className="ml-8 hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <ButtonLink key={link.href} render={<Link href={link.href} />} variant="ghost" size="sm">
              {link.label}
            </ButtonLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <DocsSearchTrigger />
          <DocsGithubLink stars={githubStars} />
        </div>
      </div>
      <div className="border-border/70 border-t">
        <div className={cn(landingWidthClassName, "py-2")}>
          <SkinPicker />
        </div>
      </div>
    </AppShellHeader>
  );
}

function LandingFooter() {
  return (
    <footer className="border-border/70 border-t">
      <div className={cn(landingWidthClassName, "flex flex-wrap items-center justify-between gap-4 py-8")}>
        <ThemeModeSwitch />
        <Text as="p" size="label" tone="muted">
          by{" "}
          <a
            href={siteConfig.author.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-foreground/30 underline-offset-2 hover:text-foreground"
          >
            {siteConfig.author.name}
          </a>
        </Text>
      </div>
    </footer>
  );
}

export function LandingShell({
  children,
  githubStars,
  searchItems,
}: {
  children: ReactNode;
  githubStars: number | null;
  searchItems: SearchItem[];
}) {
  return (
    <div data-landing-shell="" className="flex min-h-svh flex-col bg-canvas text-foreground">
      <DocsSearchProvider items={searchItems}>
        <LandingHeader githubStars={githubStars} />
        <main className="@container/home flex-1">{children}</main>
        <LandingFooter />
      </DocsSearchProvider>
    </div>
  );
}
