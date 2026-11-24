"use client";

import { DocsBrand } from "@/app/(features)/brand/docs-brand";
import { DocsFeedback } from "@/app/(features)/feedback/docs-feedback";
import { DocsSearchTrigger } from "@/app/(features)/sidebar/search";
import { AppShellCorner } from "@/components/control-ui/ui/app-shell";
import { Button } from "@/components/control-ui/ui/button";
import { SidebarMobileTrigger, SidebarTrigger } from "@/components/control-ui/ui/sidebar";
import { SkinPresetControls } from "@/components/theme-drawer/skin-preset-controls";
import { ThemeModeSwitch } from "@/components/theme-toggle";
import { DocsGithubLink } from "./github-link";
import { DocsBylineLink, DocsResourceLinks } from "./site-links";

export function DocsTopCorners({ githubStars, onEditTheme }: { githubStars: number | null; onEditTheme: () => void }) {
  return (
    <>
      <AppShellCorner placement="top-start">
        <span data-docs-sidebar-trigger="" className="contents max-sidebar:hidden sidebar:has-[[aria-expanded=true]]:hidden">
          <SidebarTrigger />
        </span>
        <DocsBrand />
        <DocsSearchTrigger className="ms-auto max-sidebar:hidden" />
        <SkinPresetControls className="w-40 justify-between max-sidebar:hidden" onNavigate={onEditTheme} />
      </AppShellCorner>
      <AppShellCorner placement="top-end">
        <DocsGithubLink stars={githubStars} />
      </AppShellCorner>
    </>
  );
}

export function DocsBottomCorners({ onEditTheme }: { onEditTheme: () => void }) {
  return (
    <>
      <AppShellCorner placement="bottom-start">
        <ThemeModeSwitch className="max-sidebar:hidden" />
        <DocsBylineLink className="ms-auto max-sidebar:hidden" />
        <SkinPresetControls className="w-40 justify-between sidebar:hidden" onNavigate={onEditTheme} />
      </AppShellCorner>
      <AppShellCorner placement="bottom-end">
        <span className="contents max-sidebar:hidden">
          <DocsFeedback />
          <DocsResourceLinks />
        </span>
        <SidebarMobileTrigger render={<Button variant="surface" size="sm" />} className="sidebar:hidden" />
      </AppShellCorner>
    </>
  );
}
