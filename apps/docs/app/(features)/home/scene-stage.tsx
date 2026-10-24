"use client";

import Link from "next/link";
import { BlockPreview } from "@/app/(features)/components/previews";
import { useDocsIntegration } from "@/app/(features)/page-templates/integration";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";
import { Text } from "@/components/control-ui/ui/typography";
import { defaultHeroSceneId, heroScenes, inlineLinkClassName } from "./showcase";

export function SceneStage() {
  const integration = useDocsIntegration();

  return (
    <div className="px-5 md:px-8">
      <Tabs defaultValue={defaultHeroSceneId} className="isolate mx-auto grid w-full min-w-0 max-w-7xl gap-4">
        <TabsList aria-label="Template" className="max-w-full justify-self-center overflow-x-auto">
          {heroScenes.map((scene) => (
            <TabsTab key={scene.id} value={scene.id}>
              {scene.name}
            </TabsTab>
          ))}
        </TabsList>
        {heroScenes.map((scene) => (
          <TabsPanel key={scene.id} value={scene.id} className="grid min-w-0 gap-4">
            <BlockPreview blockId={scene.id} integration={integration} />
            <Text as="p" tone="muted" className="mx-auto max-w-2xl text-pretty text-center">
              {scene.summary}{" "}
              <Link href={scene.href} className={inlineLinkClassName}>
                Open {scene.name}
              </Link>
              .
            </Text>
          </TabsPanel>
        ))}
      </Tabs>
    </div>
  );
}
