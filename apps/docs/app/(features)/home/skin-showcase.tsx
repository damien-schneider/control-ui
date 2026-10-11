"use client";

import Link from "next/link";
import { Fragment, useId } from "react";
import type { SkinMetaId } from "@/app/(features)/model/types";
import { Button } from "@/components/control-ui/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { Field, FieldContent, FieldControl, FieldLabel } from "@/components/control-ui/ui/field";
import { Input } from "@/components/control-ui/ui/input";
import { Switch } from "@/components/control-ui/ui/switch";
import { Toggle, ToggleGroup } from "@/components/control-ui/ui/toggle";
import { Text } from "@/components/control-ui/ui/typography";
import { resetConversation } from "@/components/theme-drawer/generation-store";
import { SKIN_META_BY_ID } from "@/components/theme-drawer/presets";
import { SkinLogo } from "@/components/theme-drawer/skin-logo";
import { useThemeRuntime } from "@/components/theme-drawer/theme-runtime-context";
import { inlineLinkClassName, tryoutSkinIds, tryoutSkinPageIds } from "./showcase";

function ReleaseNotesCard() {
  const switchId = useId();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Release notes</CardTitle>
        <CardDescription>Hear about new versions.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Field>
          <FieldLabel>Email</FieldLabel>
          <FieldControl render={<Input size="sm" defaultValue="ada@example.com" />} />
        </Field>
        <Field orientation="horizontal" className="items-center justify-between">
          <FieldContent>
            <FieldLabel htmlFor={switchId}>Weekly digest</FieldLabel>
          </FieldContent>
          <Switch id={switchId} defaultChecked />
        </Field>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="surface">Cancel</Button>
        <Button variant="solid" tone="primary">
          Subscribe
        </Button>
      </CardFooter>
    </Card>
  );
}

const skinPickerId = "home-skin-picker";

function scrollContainerOf(element: Element): Element {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    const scrolls = (overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight;
    if (scrolls) return node;
  }
  return document.scrollingElement ?? document.documentElement;
}

function alignPicker(previousTop: number) {
  const picker = document.getElementById(skinPickerId);
  if (!picker) return;
  const drift = picker.getBoundingClientRect().top - previousTop;
  scrollContainerOf(picker).scrollBy({ top: drift, behavior: "instant" });
}

function keepPickerInPlace(previousTop: number, restoreFocus: boolean) {
  alignPicker(previousTop);
  if (restoreFocus)
    document.getElementById(skinPickerId)?.querySelector<HTMLElement>("[aria-pressed='true']")?.focus({ preventScroll: true });
  document.fonts.ready.then(() => alignPicker(previousTop));
}

export function SkinShowcase() {
  const { t, selectSkin } = useThemeRuntime();
  const activeSkin = SKIN_META_BY_ID[t.skin];

  function applySkin([skin]: SkinMetaId[]) {
    const picker = document.getElementById(skinPickerId);
    if (!skin || !picker) return;
    const previousTop = picker.getBoundingClientRect().top;
    const hadFocus = picker.contains(document.activeElement);
    selectSkin(skin);
    resetConversation();
    requestAnimationFrame(() => keepPickerInPlace(previousTop, hadFocus));
  }

  return (
    <div className="grid min-w-0 gap-6 @4xl/home:grid-cols-2 @4xl/home:items-start">
      <div className="grid min-h-80 min-w-0 place-items-center rounded-[var(--radius-panel)] border border-border/70 bg-background p-6">
        <div inert aria-hidden="true" className="w-full max-w-sm select-none">
          <ReleaseNotesCard />
        </div>
      </div>
      <div className="grid min-w-0 content-start gap-4">
        <ToggleGroup
          id={skinPickerId}
          value={[t.skin]}
          onValueChange={applySkin}
          aria-label="Skin for this site"
          className="flex-wrap justify-start"
        >
          {tryoutSkinIds.map((id) => (
            <Toggle key={id} value={id}>
              <SkinLogo id={id} size="sm" />
              {SKIN_META_BY_ID[id].label}
            </Toggle>
          ))}
        </ToggleGroup>
        <Text as="p" tone="muted" className="text-pretty">
          <span className="font-medium text-foreground">{activeSkin.label}:</span> {activeSkin.description}
        </Text>
        <Text as="p" tone="muted">
          Install a skin:{" "}
          {tryoutSkinPageIds.map((id, index) => (
            <Fragment key={id}>
              {index > 0 ? ", " : null}
              <Link href={`/skins/${id}`} className={inlineLinkClassName}>
                {SKIN_META_BY_ID[id].label}
              </Link>
            </Fragment>
          ))}
          .
        </Text>
      </div>
    </div>
  );
}
