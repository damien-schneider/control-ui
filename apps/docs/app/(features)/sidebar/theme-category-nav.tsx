"use client";

import { CodeXmlIcon, ShieldCheckIcon, WandSparklesIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { IntentLink } from "@/app/(features)/client/intent-link";
import { Button } from "@/components/control-ui/ui/button";
import { Separator } from "@/components/control-ui/ui/separator";
import { SidebarGroup, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from "@/components/control-ui/ui/sidebar";
import { setDrawerOpen } from "@/components/theme-drawer/generation-store";
import { THEME_CATEGORIES, themeCategoryForPath } from "@/components/theme-drawer/theme-categories";
import { useThemeRuntime } from "@/components/theme-drawer/theme-runtime-context";
import { categoryTokenNames, TOKEN_CATEGORIES } from "@/components/theme-drawer/token-metadata";

export function ThemeCategoryNav({ onNavigate }: { onNavigate: () => void }) {
  return (
    <Suspense>
      <ThemeCategoryNavContent onNavigate={onNavigate} />
    </Suspense>
  );
}

function ThemeCategoryNavContent({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sourceActive = pathname === "/theme-editor" && searchParams.get("view") === "source";
  const auditActive = pathname === "/theme-accessibility";
  const activeCategory = sourceActive || auditActive ? null : themeCategoryForPath(pathname);
  const { t } = useThemeRuntime();
  const edited = new Set([...Object.keys(t.overrides), ...Object.keys(t.light), ...Object.keys(t.dark)]);

  return (
    <>
      <SidebarGroup>
        <Button
          variant="surface"
          size="sm"
          className="mb-4 w-full justify-start"
          aria-haspopup="dialog"
          onClick={() => {
            setDrawerOpen(true);
            if (auditActive) router.push("/theme-editor");
            onNavigate();
          }}
        >
          <WandSparklesIcon aria-hidden />
          Generate a theme
        </Button>
        <SidebarMenu indicator="hover">
          {THEME_CATEGORIES.map((category) => {
            const tokens = TOKEN_CATEGORIES.find((tokenCategory) => tokenCategory.group === category.id);
            const editCount = tokens ? categoryTokenNames(tokens).filter((name) => edited.has(name)).length : 0;
            const isActive = activeCategory === category.id;
            return (
              <SidebarMenuItem key={category.id}>
                <SidebarMenuButton
                  render={
                    <IntentLink
                      href={category.href}
                      onClick={onNavigate}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={editCount > 0 ? `${category.title}, ${editCount} edited` : undefined}
                    />
                  }
                  isActive={isActive}
                  size="sm"
                >
                  <span className="min-w-0 truncate">{category.title}</span>
                </SidebarMenuButton>
                {editCount > 0 ? <SidebarMenuBadge aria-hidden>{editCount}</SidebarMenuBadge> : null}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
      <Separator />
      <SidebarGroup>
        <SidebarMenu indicator="hover">
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<IntentLink href="/theme-editor?view=source" onClick={onNavigate} aria-current={sourceActive ? "page" : undefined} />}
              isActive={sourceActive}
              size="sm"
            >
              <CodeXmlIcon aria-hidden />
              Source & export
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<IntentLink href="/theme-accessibility" onClick={onNavigate} aria-current={auditActive ? "page" : undefined} />}
              isActive={auditActive}
              size="sm"
            >
              <ShieldCheckIcon aria-hidden />
              Accessibility audit
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
