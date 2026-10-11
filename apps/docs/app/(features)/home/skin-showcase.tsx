"use client";

import Link from "next/link";
import { lazy, Suspense, useId } from "react";
import type { SkinMetaId } from "@/app/(features)/model/types";
import { controlEffectsAttribute } from "@/components/control-ui/skin";
import { SkinProvider } from "@/components/control-ui/skin-provider";
import { Button } from "@/components/control-ui/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { Field, FieldContent, FieldControl, FieldLabel } from "@/components/control-ui/ui/field";
import { Input } from "@/components/control-ui/ui/input";
import { Switch } from "@/components/control-ui/ui/switch";
import { Text } from "@/components/control-ui/ui/typography";
import { SKIN_CONFIGS } from "@/components/skin-registry";
import { MODE_LOCKED_SKINS, MOTION_REDUCED_SKINS } from "@/components/theme";
import { SkinLogo } from "@/components/theme-drawer/skin-logo";
import { useThemeRuntime } from "@/components/theme-drawer/theme-runtime-context";
import { showcasedSkins } from "./showcase";

const SketchStrokeRuntime = lazy(() =>
  import("@/src/registry/skin-packs/sketch/sketch-stroke-runtime").then((module) => ({ default: module.SketchStrokeRuntime })),
);

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

function SkinTile({ id, label, description }: { id: SkinMetaId; label: string; description: string }) {
  const skin = SKIN_CONFIGS[id];
  const nameId = `home-skin-${id}-name`;

  return (
    <article className="group relative grid min-w-0 grid-rows-[1fr_auto] rounded-[var(--radius-panel)] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-canvas">
      <Link href={`/skins/${id}`} aria-labelledby={nameId} className="absolute inset-0 z-10 rounded-[inherit] outline-none" />
      <div className="grid min-w-0 overflow-hidden rounded-[inherit] border border-border/70 transition-[border-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:border-foreground/30">
        <SkinProvider skin={skin}>
          <div
            inert
            aria-hidden="true"
            data-skin={id}
            data-effects={controlEffectsAttribute(skin.effects)}
            data-motion={MOTION_REDUCED_SKINS.includes(id) ? "reduced" : undefined}
            style={{ colorScheme: MODE_LOCKED_SKINS[id] }}
            className="hidden min-w-0 select-none place-items-center bg-background p-6 font-sans text-foreground [:root[data-skin=none]_&]:grid"
          >
            <ReleaseNotesCard />
          </div>
        </SkinProvider>
        <Text as="p" tone="muted" className="p-6 text-pretty [:root[data-skin=none]_&]:hidden">
          {description}
        </Text>
      </div>
      <div className="mt-3 flex min-w-0 items-center gap-2 px-0.5">
        <SkinLogo id={id} size="sm" />
        <Text id={nameId} weight="medium" tone="foreground" className="min-w-0 truncate">
          {label}
        </Text>
      </div>
    </article>
  );
}

export function SkinShowcaseTiles() {
  const { t } = useThemeRuntime();
  const sketchStrokesNeedOwnRuntime = t.skin !== "sketch";

  return (
    <>
      {showcasedSkins.map((skin) => (
        <SkinTile key={skin.id} id={skin.id} label={skin.label} description={skin.description} />
      ))}
      {sketchStrokesNeedOwnRuntime ? (
        <Suspense fallback={null}>
          <SketchStrokeRuntime />
        </Suspense>
      ) : null}
    </>
  );
}
