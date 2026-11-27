"use client";

import type { ComponentType } from "react";
import type { AtlasFeaturedId } from "../atlas-layout";
import { ChartPreview, CodeDiffPreview, TimelinePreview } from "./featured/data-previews";
import { FlowPreview } from "./featured/flow-preview";
import { ColorPickerPreview, EmojiPickerPreview, InputOtpPreview } from "./featured/form-previews";
import { MixerPreview } from "./featured/mixer-preview";
import { CommandPreview, TreePreview } from "./featured/navigation-previews";
import { RichTooltipPreview } from "./featured/rich-tooltip-preview";

const previews: Record<AtlasFeaturedId, ComponentType> = {
  "channel-strip": MixerPreview,
  flow: FlowPreview,
  "color-picker": ColorPickerPreview,
  "emoji-picker": EmojiPickerPreview,
  command: CommandPreview,
  "rich-tooltip": RichTooltipPreview,
  tree: TreePreview,
  "code-diff": CodeDiffPreview,
  chart: ChartPreview,
  timeline: TimelinePreview,
  "input-otp": InputOtpPreview,
};

export function FeaturedPreview({ id }: { id: AtlasFeaturedId }) {
  const Preview = previews[id];
  return <Preview />;
}
