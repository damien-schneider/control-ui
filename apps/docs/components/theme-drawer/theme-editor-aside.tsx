"use client";

import { type ReactNode, useMemo } from "react";
import { Card, CardContent } from "@/components/control-ui/ui/card";
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/control-ui/ui/item";
import { Switch } from "@/components/control-ui/ui/switch";
import { TableOfContents } from "@/components/control-ui/ui/table-of-contents";
import { Text } from "@/components/control-ui/ui/typography";
import { BASE_SKIN_ID } from "@/components/theme";
import type { ThemeContractGroup } from "@/src/registry/lib/theme-contract";
import { ContrastPanel } from "./contrast-panel";
import { VarTag } from "./controls";
import { themePreviewSections } from "./preview-sections";
import { parseSkinTheme, skinChangedTokenNames, themeFile, useSkinSource } from "./skin-source";
import { SKIN_CATEGORY, type ThemeCategoryId } from "./theme-categories";
import { useThemeRuntime } from "./theme-runtime-context";
import { TOKEN_CATEGORIES } from "./token-metadata";
import { type TokenEditorProps, TokenPanel } from "./token-panel";

export function ThemeTokenPanel({ group }: { group: ThemeContractGroup }) {
  const { t: theme, values, isDark, setTokens, resetToken, patch } = useThemeRuntime();
  const { source: skinSource } = useSkinSource(theme.skin);
  const { source: baseSkinSource } = useSkinSource(BASE_SKIN_ID);

  const changedBySkin = useMemo(() => {
    if (skinSource.status !== "ready" || baseSkinSource.status !== "ready") return null;
    const activeTheme = themeFile(skinSource.files);
    const baseTheme = themeFile(baseSkinSource.files);
    if (!activeTheme || !baseTheme) return null;
    return skinChangedTokenNames(parseSkinTheme(activeTheme.code), parseSkinTheme(baseTheme.code), isDark);
  }, [skinSource, baseSkinSource, isDark]);
  const editor: TokenEditorProps = {
    values,
    labelMode: theme.labelMode,
    overridden: new Set([...Object.keys(theme.overrides), ...Object.keys(theme.light), ...Object.keys(theme.dark)]),
    changedBySkin: changedBySkin ?? new Set(),
    onChange: (name, value) => setTokens({ [name]: value }),
    onReset: resetToken,
  };

  const reduceMotionRow = (
    <Item variant="muted">
      <ItemContent>
        <ItemTitle>Reduce motion</ItemTitle>
        <VarTag>data-motion</VarTag>
      </ItemContent>
      <ItemActions>
        <Switch aria-label="Reduce motion" checked={theme.reduceMotion} onCheckedChange={(checked) => patch({ reduceMotion: checked })} />
      </ItemActions>
    </Item>
  );
  const panelIntroByGroup: Partial<Record<ThemeContractGroup, ReactNode>> = { motion: reduceMotionRow };
  const tokenCategory = TOKEN_CATEGORIES.find((item) => item.group === group);
  if (!tokenCategory) return null;

  return (
    <Card
      size="sm"
      role="region"
      aria-label="Theme variables"
      className="min-w-0 @min-[55rem]/page-layout:sticky @min-[55rem]/page-layout:top-12 @min-[55rem]/page-layout:max-h-[calc(100svh-4rem)] @min-[55rem]/page-layout:overflow-y-auto"
    >
      <CardContent>
        <TokenPanel
          category={tokenCategory}
          editor={editor}
          headerAction={
            <Text size="micro" tone="muted" className="flex items-center gap-2">
              CSS names
              <Switch
                aria-label="Caption every control with its CSS variable name"
                checked={theme.labelMode === "css"}
                onCheckedChange={(checked) => patch({ labelMode: checked ? "css" : "friendly" })}
              />
            </Text>
          }
          beforeTokens={panelIntroByGroup[group] ?? null}
          afterCore={group === "color" ? <ContrastPanel t={theme} onFix={(textFixes) => patch({ textFixes })} /> : null}
        />
      </CardContent>
    </Card>
  );
}

export function ThemeEditorAside({ category }: { category: ThemeCategoryId }) {
  if (category === SKIN_CATEGORY) {
    const items = themePreviewSections(category).map((section) => ({ href: `#${section.id}`, label: section.title }));
    return <TableOfContents items={items} className="top-12" />;
  }
  return <ThemeTokenPanel group={category} />;
}
