"use client";

import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BlockPreview, ComponentPreview } from "@/app/(features)/components/previews";
import { ColorFoundations } from "@/app/(features)/foundations/color-foundations";
import { ElevationFoundations } from "@/app/(features)/foundations/elevation-foundations";
import { FocusFoundations } from "@/app/(features)/foundations/focus-foundations";
import { MotionFoundations } from "@/app/(features)/foundations/motion-foundations";
import { RadiusFoundations } from "@/app/(features)/foundations/radius-foundations";
import { SizingFoundations } from "@/app/(features)/foundations/sizing-foundations";
import { SurfaceFoundations } from "@/app/(features)/foundations/surface-foundations";
import { TypographyFoundations } from "@/app/(features)/foundations/typography-foundations";
import { SectionStack } from "@/app/(features)/page-templates/shared";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { Heading } from "@/components/control-ui/ui/typography";
import type { ThemeContractGroup } from "@/src/registry/lib/theme-contract";
import { type ThemePreviewSection, themePreviewSections } from "./preview-sections";
import type { ThemeCategoryId } from "./theme-categories";

function LayoutFoundations() {
  return (
    <div className="grid min-w-0 gap-10">
      <SizingFoundations />
      <FocusFoundations />
    </div>
  );
}

const FOUNDATION_BY_GROUP: Record<ThemeContractGroup, () => ReactNode> = {
  color: ColorFoundations,
  typography: TypographyFoundations,
  radius: RadiusFoundations,
  shadow: ElevationFoundations,
  motion: MotionFoundations,
  surface: SurfaceFoundations,
  layout: LayoutFoundations,
};

function SectionContent({ section }: { section: ThemePreviewSection }) {
  if (section.kind === "foundation") {
    const Foundation = FOUNDATION_BY_GROUP[section.group];
    return <Foundation />;
  }
  if (section.kind === "component") return <ComponentPreview componentId={section.componentId} />;
  return <BlockPreview blockId="settings" integration="mastra" />;
}

export function ThemePreviews({ category }: { category: ThemeCategoryId }) {
  return (
    <SectionStack>
      {themePreviewSections(category).map((section) => (
        <section key={section.id} id={section.id} aria-label={section.title} className="min-w-0 scroll-mt-20">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Heading level={2}>{section.title}</Heading>
            {section.kind === "component" ? (
              <ButtonLink
                render={<Link href={`/components/${section.componentId}`} />}
                variant="quiet"
                size="xs"
                iconOnly
                aria-label={`${section.title} documentation`}
                title={`${section.title} documentation`}
              >
                <ArrowUpRightIcon aria-hidden />
              </ButtonLink>
            ) : null}
          </div>
          <SectionContent section={section} />
        </section>
      ))}
    </SectionStack>
  );
}
