"use client";

import { CheckIcon, FileTextIcon, FolderOpenIcon, LayoutGridIcon, PlusIcon, SaveIcon, Settings2Icon, XIcon } from "lucide-react";
import { useId, useState } from "react";
import type { OpenChangeEventDetails } from "@/components/control-ui/control-props";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";
import {
  MorphingPanel,
  MorphingPanelBody,
  MorphingPanelClose,
  MorphingPanelContent,
  MorphingPanelFooter,
  MorphingPanelHeader,
  MorphingPanelPositioner,
  MorphingPanelTrigger,
} from "@/components/control-ui/ui/morphing-panel";
import { Slider } from "@/components/control-ui/ui/slider";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";
import { Textarea } from "@/components/control-ui/ui/textarea";
import { Heading, Text } from "@/components/control-ui/ui/typography";

const sections = {
  dimensions: { width: "360px", height: "304px" },
  "aspect-ratio": { width: "360px", height: "268px" },
  prompt: { width: "360px", height: "284px" },
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
  const titleId = useId();
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

  return (
    <MorphingPanel
      open={open}
      onOpenChange={handleOpenChange}
      collapsedSize={{ width: "132px", height: "52px" }}
      expandedSize={sections[section]}
      data-example="settings"
      data-last-open-reason={lastOpenReason}
    >
      <MorphingPanelTrigger render={<Button variant="quiet" />} aria-label={open ? "Close style settings" : "Open style settings"}>
        {open ? (
          <XIcon aria-hidden="true" className="size-4" />
        ) : (
          <>
            <span>Add style</span>
            <PlusIcon aria-hidden="true" className="size-4" />
          </>
        )}
      </MorphingPanelTrigger>
      <MorphingPanelContent keepMounted role="region" aria-labelledby={titleId} className="overflow-hidden">
        <MorphingPanelHeader>
          <Heading level={2} size="label" id={titleId}>
            Canvas settings
          </Heading>
        </MorphingPanelHeader>
        <MorphingPanelBody className="p-0">
          <Tabs value={section} onValueChange={setSection} className="h-full min-h-0">
            <TabsList size="xs" aria-label="Canvas settings" className="mx-4 grid w-auto shrink-0 grid-cols-3 gap-0">
              <TabsTab value="dimensions" className="min-w-0 px-1">
                Size
              </TabsTab>
              <TabsTab value="aspect-ratio" className="min-w-0 px-1">
                Ratio
              </TabsTab>
              <TabsTab value="prompt" className="min-w-0 px-1">
                Prompt
              </TabsTab>
            </TabsList>
            <TabsPanel value="dimensions" className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="grid gap-5">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <Text size="caption">Width</Text>
                    <Text size="caption" tone="muted">
                      {width}px
                    </Text>
                  </div>
                  <Slider
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
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <Text size="caption">Height</Text>
                    <Text size="caption" tone="muted">
                      {height}px
                    </Text>
                  </div>
                  <Slider
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
              </div>
            </TabsPanel>
            <TabsPanel value="aspect-ratio" className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] gap-1">
                {ratios.map((item) => (
                  <Button
                    key={item.label}
                    variant="quiet"
                    size="sm"
                    active={ratio === item.label}
                    aria-pressed={ratio === item.label}
                    onClick={() => {
                      setRatio(item.label);
                      setSaved(false);
                    }}
                    className="justify-start gap-2"
                  >
                    <span
                      aria-hidden="true"
                      style={{ aspectRatio: item.value }}
                      className="w-3.5 rounded-[var(--radius-sm)] border border-current bg-current/8"
                    />
                    {item.label}
                  </Button>
                ))}
              </div>
            </TabsPanel>
            <TabsPanel value="prompt" className="min-h-0 flex-1 overflow-y-auto p-4">
              <Textarea
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.currentTarget.value);
                  setSaved(false);
                }}
                aria-label="Style prompt"
                className="h-full min-h-20 resize-none"
              />
            </TabsPanel>
          </Tabs>
        </MorphingPanelBody>
        <MorphingPanelFooter className="justify-between">
          <Text size="caption" tone="muted" role="status" className="flex min-w-0 items-center gap-2">
            <span aria-hidden="true" className={cn("size-1.5 rounded-full", saved ? "bg-muted-foreground" : "bg-primary")} />
            {saved ? "Saved" : "Edited"}
          </Text>
          <MorphingPanelClose variant="solid" tone="primary" size="sm" onClick={() => setSaved(true)}>
            <CheckIcon aria-hidden="true" className="size-3.5" />
            Apply
          </MorphingPanelClose>
        </MorphingPanelFooter>
      </MorphingPanelContent>
    </MorphingPanel>
  );
}

const workspaceItems = [
  { label: "Overview", icon: LayoutGridIcon },
  { label: "Projects", icon: FolderOpenIcon },
  { label: "Notes", icon: FileTextIcon },
  { label: "Settings", icon: Settings2Icon },
];

export function PrimitiveMorphingPanelMenuExample() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Overview");
  return (
    <div className="relative h-88 w-full overflow-hidden rounded-xl border bg-muted/20">
      <div className="p-5">
        <Text size="caption" tone="muted">
          Studio workspace
        </Text>
        <Heading level={3} size="heading-4" className="mt-1">
          {active}
        </Heading>
      </div>
      <MorphingPanelPositioner anchor="bottom-start" className="absolute inset-4">
        <MorphingPanel
          open={open}
          onOpenChange={setOpen}
          collapsedSize={{ width: "152px", height: "48px" }}
          expandedSize={{ width: "272px", height: "284px" }}
          data-example="menu"
        >
          <MorphingPanelTrigger render={<Button variant="quiet" />} aria-label={open ? "Close workspace menu" : "Open workspace menu"}>
            {open ? (
              <XIcon aria-hidden="true" className="size-4" />
            ) : (
              <>
                <LayoutGridIcon aria-hidden="true" className="size-4" />
                <span>Workspace</span>
              </>
            )}
          </MorphingPanelTrigger>
          <MorphingPanelContent role="region" aria-labelledby={titleId} className="overflow-hidden">
            <MorphingPanelHeader>
              <Heading level={3} size="label" id={titleId}>
                Your workspace
              </Heading>
            </MorphingPanelHeader>
            <MorphingPanelBody className="grid content-start gap-1 px-2 pt-0">
              <nav aria-label="Workspace" className="grid gap-1">
                {workspaceItems.map(({ label, icon: Icon }) => (
                  <MorphingPanelClose
                    key={label}
                    variant="quiet"
                    active={active === label}
                    className="w-full justify-start"
                    aria-current={active === label ? "page" : undefined}
                    onClick={() => setActive(label)}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    {label}
                  </MorphingPanelClose>
                ))}
              </nav>
            </MorphingPanelBody>
            <MorphingPanelFooter className="justify-start">
              <Text size="caption" tone="muted">
                A little room for everything.
              </Text>
            </MorphingPanelFooter>
          </MorphingPanelContent>
        </MorphingPanel>
      </MorphingPanelPositioner>
    </div>
  );
}

export function PrimitiveMorphingPanelConfirmationExample() {
  const titleId = useId();
  const descriptionId = useId();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <div className="relative h-88 w-full overflow-hidden rounded-xl border bg-muted/20">
      <div className="p-5">
        <Text size="caption" tone="muted">
          Project settings
        </Text>
        <Heading level={3} size="heading-4" className="mt-1">
          Ready when you are.
        </Heading>
        <Text as="p" size="caption" tone="muted" role="status" className="mt-2">
          {saved ? "Your changes have been saved." : "You have unpublished changes."}
        </Text>
      </div>
      <MorphingPanelPositioner anchor="bottom-end" className="absolute inset-4">
        <MorphingPanel
          open={open}
          onOpenChange={setOpen}
          collapsedSize={{ width: "108px", height: "44px" }}
          expandedSize={{ width: "328px", height: "244px" }}
          data-example="confirmation"
        >
          <MorphingPanelTrigger
            render={<Button variant="quiet" />}
            aria-label={open ? "Close save confirmation" : "Save changes"}
            aria-haspopup="dialog"
          >
            {open ? (
              <XIcon aria-hidden="true" className="size-4" />
            ) : (
              <>
                <span>{saved ? "Saved" : "Save"}</span>
                {saved ? <CheckIcon aria-hidden="true" className="size-4" /> : <SaveIcon aria-hidden="true" className="size-4" />}
              </>
            )}
          </MorphingPanelTrigger>
          <MorphingPanelContent
            role="dialog"
            aria-modal={false}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            autoFocus
            className="overflow-hidden"
          >
            <MorphingPanelHeader>
              <Heading level={3} size="label" id={titleId}>
                Save changes?
              </Heading>
            </MorphingPanelHeader>
            <MorphingPanelBody className="pt-1">
              <Text as="p" tone="muted" id={descriptionId}>
                Update the shared project with your latest settings. Everyone in your workspace will see the changes.
              </Text>
            </MorphingPanelBody>
            <MorphingPanelFooter>
              <MorphingPanelClose variant="quiet">Cancel</MorphingPanelClose>
              <MorphingPanelClose variant="solid" tone="primary" onClick={() => setSaved(true)}>
                <CheckIcon aria-hidden="true" className="size-4" />
                Confirm save
              </MorphingPanelClose>
            </MorphingPanelFooter>
          </MorphingPanelContent>
        </MorphingPanel>
      </MorphingPanelPositioner>
    </div>
  );
}
