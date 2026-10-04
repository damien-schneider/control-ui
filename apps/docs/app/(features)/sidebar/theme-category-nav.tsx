"use client";

import { CodeXmlIcon, ShieldCheckIcon, WandSparklesIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/control-ui/ui/sidebar";
import { Text } from "@/components/control-ui/ui/typography";
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
          <WandSparklesIcon aria-hidden className="size-3.5" />
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
                    <Link
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
                  {editCount > 0 ? (
                    <Text aria-hidden size="caption" tone="muted" className="ml-auto">
                      {editCount}
                    </Text>
                  ) : null}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="border-t border-sidebar-border pt-3">
        <SidebarMenu indicator="hover">
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/theme-editor?view=source" onClick={onNavigate} aria-current={sourceActive ? "page" : undefined} />}
              isActive={sourceActive}
              size="sm"
            >
              <CodeXmlIcon aria-hidden className="size-4" />
              Source & export
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/theme-accessibility" onClick={onNavigate} aria-current={auditActive ? "page" : undefined} />}
              isActive={auditActive}
              size="sm"
            >
              <ShieldCheckIcon aria-hidden className="size-4" />
              Accessibility audit
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
