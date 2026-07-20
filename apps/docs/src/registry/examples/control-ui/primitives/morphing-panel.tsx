"use client";

import { CheckIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import type { OpenChangeEventDetails } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { AspectRatio } from "@/components/control-ui/ui/aspect-ratio";
import { Button } from "@/components/control-ui/ui/button";
import { MorphingPanel, MorphingPanelContent, MorphingPanelTrigger } from "@/components/control-ui/ui/morphing-panel";
import { Slider } from "@/components/control-ui/ui/slider";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";
import { Textarea } from "@/components/control-ui/ui/textarea";

const sections = {
  dimensions: { width: "320px", height: "240px" },
  "aspect-ratio": { width: "320px", height: "188px" },
  prompt: { width: "320px", height: "240px" },
} as const;

type Section = keyof typeof sections;

const ratios = [
  { label: "1:1", value: 1 },
  { label: "16:9", value: 16 / 9 },
  { label: "21:9", value: 21 / 9 },
  { label: "3:4", value: 3 / 4 },
  { label: "4:3", value: 4 / 3 },
  { label: "Custom", value: 7 / 5 },
] as const;

export function PrimitiveMorphingPanelExample() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section>("dimensions");
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [ratio, setRatio] = useState("16:9");
  const [prompt, setPrompt] = useState("Soft daylight, quiet geometry, editorial detail.");
  const [saved, setSaved] = useState(true);
  const [lastOpenReason, setLastOpenReason] = useState<string>();

  function handleOpenChange(nextOpen: boolean, details: OpenChangeEventDetails) {
    setOpen(nextOpen);
    setLastOpenReason(details.reason);
  }

  function selectSection(value: string) {
    setSection(value as Section);
  }

  function applyChanges() {
    setSaved(true);
    setOpen(false);
  }

  return (
    <div className="flex min-h-80 w-full items-center justify-center px-3">
      <MorphingPanel
        open={open}
        onOpenChange={handleOpenChange}
        collapsedSize={{ width: "132px", height: "52px" }}
        expandedSize={sections[section]}
        data-last-open-reason={lastOpenReason}
      >
        <MorphingPanelTrigger render={<Button variant="quiet" />} aria-label={open ? "Close style settings" : "Open style settings"}>
          <span className="max-w-20 overflow-hidden whitespace-nowrap text-left transition-[max-width,opacity,filter] duration-[var(--duration-base)] group-data-[state=open]/morphing-panel-trigger:max-w-0 group-data-[state=open]/morphing-panel-trigger:opacity-0 group-data-[state=open]/morphing-panel-trigger:blur-sm">
            Add style
          </span>
          <PlusIcon aria-hidden="true" className="size-4 text-muted-foreground" />
        </MorphingPanelTrigger>

        <MorphingPanelContent keepMounted>
          <Tabs value={section} onValueChange={selectSection} className="flex h-full flex-col">
            <div className="min-w-0 p-2 pb-0">
              <TabsList size="xs" className="max-w-[calc(100%-2.75rem)] overflow-x-auto overscroll-x-contain">
                <TabsTab value="dimensions">Dimensions</TabsTab>
                <TabsTab value="aspect-ratio">Aspect ratio</TabsTab>
                <TabsTab value="prompt">Prompt</TabsTab>
              </TabsList>
            </div>

            <TabsPanel value="dimensions" className="flex min-h-0 flex-1 flex-col justify-between px-2 pt-4 pb-2">
              <div className="grid gap-3">
                <Slider
                  variant="plain"
                  label="Width"
                  value={width}
                  onValueChange={(value) => {
                    setWidth(value);
                    setSaved(false);
                  }}
                  min={640}
                  max={1920}
                  step={160}
                  formatValue={(value) => `${value}px`}
                />
                <Slider
                  variant="plain"
                  label="Height"
                  value={height}
                  onValueChange={(value) => {
                    setHeight(value);
                    setSaved(false);
                  }}
                  min={480}
                  max={1080}
                  step={120}
                  formatValue={(value) => `${value}px`}
                />
              </div>
              <SettingsFooter saved={saved} onApply={applyChanges} />
            </TabsPanel>

            <TabsPanel value="aspect-ratio" className="flex min-h-0 flex-1 flex-col justify-between px-2 pt-3 pb-2">
              <div className="grid grid-cols-3 gap-1">
                {ratios.map((item) => {
                  const selected = ratio === item.label;
                  return (
                    <Button
                      key={item.label}
                      variant="quiet"
                      size="xs"
                      active={selected}
                      aria-pressed={selected}
                      onClick={() => {
                        setRatio(item.label);
                        setSaved(false);
                      }}
                      className="justify-start gap-2"
                    >
                      <AspectRatio ratio={item.value} className="w-3.5 rounded-[var(--radius-sm)] border border-current bg-current/8" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
              <SettingsFooter saved={saved} onApply={applyChanges} compact />
            </TabsPanel>

            <TabsPanel value="prompt" className="flex min-h-0 flex-1 flex-col justify-between px-2 pt-3 pb-2">
              <Textarea
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.currentTarget.value);
                  setSaved(false);
                }}
                aria-label="Style prompt"
                className="min-h-24"
              />
              <SettingsFooter saved={saved} onApply={applyChanges} />
            </TabsPanel>
          </Tabs>
        </MorphingPanelContent>
      </MorphingPanel>
    </div>
  );
}

function SettingsFooter({ saved, onApply, compact = false }: { saved: boolean; onApply: () => void; compact?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2 text-caption text-muted-foreground">
        <span aria-hidden="true" className={cn("size-1.5 rounded-full", saved ? "bg-muted-foreground" : "bg-primary")} />
        {saved ? "Saved" : "Changes"}
      </span>
      <Button variant="solid" tone="primary" size={compact ? "xs" : "sm"} onClick={onApply}>
        {saved ? <CheckIcon aria-hidden="true" className="size-3.5" /> : null}
        Apply
      </Button>
    </div>
  );
}
