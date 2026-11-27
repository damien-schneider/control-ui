"use client";

import { LockIcon } from "lucide-react";
import { useId, useState } from "react";
import { skinScopeAttributes } from "@/components/control-ui/skin";
import { SkinProvider } from "@/components/control-ui/skin-provider";
import { Button } from "@/components/control-ui/ui/button";
import { ButtonGroup } from "@/components/control-ui/ui/button-group";
import { Field, FieldLabel } from "@/components/control-ui/ui/field";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { acmeSkin, type PinId } from "./acme-skin";
import { PinButton, PinTarget } from "./pin-context";

const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const roles = [
  { label: "backgrounds", short: "bg", span: "col-span-2" },
  { label: "fills", short: "fills", span: "col-span-3" },
  { label: "borders", short: "borders", span: "col-span-3" },
  { label: "solid", short: "solid", span: "col-span-2" },
  { label: "text", short: "text", span: "col-span-2" },
] as const;

const channels = [
  { value: "stable", label: "Stable" },
  { value: "beta", label: "Beta" },
  { value: "canary", label: "Canary" },
] as const;

const changelog = [
  "Thread replies open in a side panel",
  "Tool approvals show risk and a preview",
  "Composer keeps drafts per channel",
  "Mixer strips align across a console",
  "Faster first paint on long transcripts",
  "Attachments upload in the background",
  "Model picker remembers the last choice",
  "Reasoning collapses once the answer lands",
  "Sources open beside the message",
  "Voice input shows a live level",
  "Mentions resolve as you type",
  "Regenerate keeps earlier branches",
  "Code blocks copy with one tap",
  "Search covers archived threads",
] as const;

const rollouts = [
  { value: "10", label: "10%" },
  { value: "50", label: "50%" },
  { value: "all", label: "All users" },
] as const;

const rampClassName = "grid max-w-77.5 grid-cols-12 gap-0.5 @sm/ramp:max-w-98.25 @sm/ramp:gap-0.75";
const cornerPinClassName = "absolute -top-2.25 -right-2.25 z-10 @4xl/home:hidden";

function Ramp({ pin, scale, label, seedStep }: { pin: PinId; scale: "primary" | "neutral"; label: string; seedStep?: number }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Text size="caption" tone="muted" mono className="min-w-0 truncate">
          {label}
        </Text>
        <PinButton pin={pin} side="preview" className="@4xl/home:hidden" />
      </div>
      <PinTarget pin={pin} className={rampClassName}>
        {steps.map((step) => (
          <span
            key={step}
            style={{ backgroundColor: `var(--scale-${scale}-${step})` }}
            className="grid aspect-square place-items-center rounded-lg outline outline-foreground/8 -outline-offset-1"
          >
            {step === seedStep ? <span className="size-1.75 rounded-full bg-white" /> : null}
          </span>
        ))}
      </PinTarget>
    </div>
  );
}

function RampRoles() {
  return (
    <div aria-hidden="true" className={rampClassName}>
      {roles.map((role) => (
        <span key={role.label} className={`grid min-w-0 justify-items-start gap-1 ${role.span}`}>
          <span className="h-1 w-full rounded-b-xs border-x border-b border-(--scale-neutral-8)" />
          <Text size="micro" tone="muted" className="@sm/ramp:hidden">
            {role.short}
          </Text>
          <Text size="micro" tone="muted" className="hidden @sm/ramp:inline">
            {role.label}
          </Text>
        </span>
      ))}
    </div>
  );
}

function Rollout() {
  const labelId = useId();
  const [rollout, setRollout] = useState<(typeof rollouts)[number]["value"]>("50");
  return (
    <div className="grid justify-items-start gap-1.75">
      <Text as="span" id={labelId} size="label" weight="medium">
        Rollout
      </Text>
      <PinTarget pin={7}>
        <ButtonGroup aria-labelledby={labelId}>
          {rollouts.map((option) => {
            const selected = option.value === rollout;
            return (
              <Button
                key={option.value}
                variant="surface"
                size="sm"
                tone={selected ? "primary" : "neutral"}
                active={selected}
                aria-pressed={selected}
                onClick={() => setRollout(option.value)}
              >
                {option.label}
              </Button>
            );
          })}
        </ButtonGroup>
        <PinButton pin={7} side="preview" className={cornerPinClassName} />
      </PinTarget>
    </div>
  );
}

function Changelog() {
  const labelId = useId();
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.75">
      <Text as="span" id={labelId} size="label" weight="medium">
        Changelog
      </Text>
      <PinTarget pin={6} part='[data-slot="scrollbar"][data-orientation="vertical"]' className="min-h-36.5 flex-1 rounded-field border">
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
          <ScrollArea aria-labelledby={labelId} lockAxis="x" className="h-full">
            <ul className="grid gap-2 py-2.5 pr-7 pl-3">
              {changelog.map((entry) => (
                <li key={entry} className="flex gap-2">
                  <span aria-hidden="true" className="mt-1.75 size-1 shrink-0 rounded-full bg-(--scale-neutral-9)" />
                  <Text size="label">{entry}</Text>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
        <PinButton pin={6} side="preview" className={cornerPinClassName} />
      </PinTarget>
    </div>
  );
}

function ReleaseCard() {
  return (
    <PinTarget pin={3} hover={false} className="flex min-h-0 flex-1 flex-col gap-5.5 rounded-lg border bg-background p-4.5 @4xl/home:p-6">
      <div className="grid justify-items-start gap-1">
        <PinTarget pin={4}>
          <Heading level={3} size="display" weight="normal">
            Ship the spring release
          </Heading>
          <PinButton pin={4} side="preview" className="absolute top-1/2 left-full ml-1 -translate-y-1/2 @4xl/home:hidden" />
        </PinTarget>
        <Text as="p" tone="muted">
          Three checks left before this goes live.
        </Text>
      </div>
      <PinTarget pin={5} part='[data-slot="icon"]'>
        <Field>
          <FieldLabel>Channel</FieldLabel>
          <Select defaultValue="stable" items={channels}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {channels.map((channel) => (
                <SelectItem key={channel.value} value={channel.value}>
                  {channel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <PinButton pin={5} side="preview" className="absolute top-3.5 -right-2.25 z-10 @4xl/home:hidden" />
      </PinTarget>
      <Changelog />
      <Rollout />
      <div className="flex justify-end gap-2">
        <Button variant="surface">Save draft</Button>
        <PinTarget pin={8} className="flex">
          <Button variant="solid">Publish</Button>
          <PinButton pin={8} side="preview" className={cornerPinClassName} />
        </PinTarget>
      </div>
      <PinTarget
        pin={3}
        anchor={false}
        className="absolute -top-2.25 -right-2.25 z-10 grid size-4.5 @4xl/home:-top-1.5 @4xl/home:-right-1.5 @4xl/home:size-9"
      >
        <PinButton pin={3} side="preview" className="@4xl/home:hidden" />
      </PinTarget>
    </PinTarget>
  );
}

export function AcmePreview() {
  return (
    <SkinProvider skin={acmeSkin}>
      <div
        {...skinScopeAttributes(acmeSkin)}
        className="flex h-full min-w-0 flex-col gap-5 rounded-[inherit] border bg-(--scale-neutral-2) p-4 font-sans text-foreground @4xl/home:gap-6 @4xl/home:p-7"
      >
        <div className="@container/ramp grid gap-4.5">
          <div className="grid gap-1.5">
            <Ramp pin={1} scale="primary" label="--scale-primary-1 … 12, derived from the seed" seedStep={9} />
            <RampRoles />
          </div>
          <Ramp pin={2} scale="neutral" label="--scale-neutral-1 … 12" />
        </div>
        <ReleaseCard />
        <Text as="p" size="caption" tone="muted" className="flex gap-2">
          <LockIcon aria-hidden="true" className="mt-0.5 size-3 shrink-0" />
          Same component source as every other skin. Nothing was forked.
        </Text>
      </div>
    </SkinProvider>
  );
}
