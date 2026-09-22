"use client";

import {
  Activity,
  ActivityContent,
  ActivityDetail,
  ActivityDetailContent,
  ActivityDetailLabel,
  ActivityIcon,
  ActivityStatus,
  ActivityTitle,
  ActivityTrigger,
} from "@/components/control-ui/activity";
import { ChatTurn } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import type { ContrastAdjustment } from "@/mastra/theme-generator-contract";
import { THEME_CONTRACT, type ThemeContractGroup } from "@/src/registry/lib/theme-contract";
import { TOKEN_GROUP_ORDER, TOKEN_GROUP_TITLES } from "./theme-categories";

export type Generation = {
  id: string;
  prompt: string;
  imageName: string | null;
  skin: string | null;
  reasoning: string;
  state: "running" | "success" | "error" | "stopped";
  paintedTokens: string[];
  paletteName: string | null;
  adjustments: ContrastAdjustment[];
  typeface: string | null;
  knobs: string[];
  error: string | null;
};

const GROUP_BY_TOKEN = new Map(THEME_CONTRACT.map((token) => [token.name, token.group]));

// A finished theme paints ~60 tokens across seven groups, so naming each one would bury the signal.
// Counting them per group still shows the work landing group by group as the model streams.
export function paintedSummary(paintedTokens: readonly string[]) {
  const counts = new Map<ThemeContractGroup, number>();
  for (const token of paintedTokens) {
    const group = GROUP_BY_TOKEN.get(token);
    if (group) counts.set(group, (counts.get(group) ?? 0) + 1);
  }

  return TOKEN_GROUP_ORDER.filter((group) => counts.has(group))
    .map((group) => `${TOKEN_GROUP_TITLES[group]} ${counts.get(group)}`)
    .join(" · ");
}

export function paintedTokensOf(tokens: Record<string, string>) {
  return Object.keys(tokens).filter((token) => GROUP_BY_TOKEN.has(token));
}

function adjustmentLine({ role, from, to, ratio }: ContrastAdjustment) {
  const chroma = to.C === 0 && from.C > 0 ? ", chroma dropped" : "";
  return `${role}: L ${from.L.toFixed(2)} → ${to.L.toFixed(2)}${chroma} (${ratio.toFixed(1)}:1)`;
}

function askedFor({ imageName, prompt }: Generation) {
  if (!imageName) return prompt;
  return prompt ? `${imageName} — ${prompt}` : imageName;
}

function ReasoningTrace({ generation }: { generation: Generation }) {
  if (!generation.reasoning) return null;

  return (
    <Activity kind="reasoning" name="Thinking" state={generation.state === "running" ? "running" : "success"}>
      <ActivityTrigger>
        <ActivityIcon />
        <ActivityTitle />
        <ActivityStatus />
      </ActivityTrigger>
      <ActivityContent>
        <ActivityDetail>
          <ActivityDetailContent className="whitespace-pre-wrap">{generation.reasoning}</ActivityDetailContent>
        </ActivityDetail>
      </ActivityContent>
    </Activity>
  );
}

export function ThemeGeneration({ generation }: { generation: Generation }) {
  return (
    <div className="flex flex-col gap-2">
      <ChatTurn from="user">
        <ChatMessage from="user">
          <ChatMessageRow>
            <ChatMessageBody>
              <ChatMessageContent>{askedFor(generation)}</ChatMessageContent>
            </ChatMessageBody>
          </ChatMessageRow>
        </ChatMessage>
      </ChatTurn>

      <ReasoningTrace generation={generation} />

      <Activity
        kind="tool"
        name={generation.paletteName ?? "Painting tokens"}
        state={generation.state === "stopped" ? "pending" : generation.state}
        statusLabel={generation.state === "stopped" ? "Stopped" : undefined}
      >
        <ActivityTrigger>
          <ActivityIcon />
          <ActivityTitle />
          <ActivityStatus />
        </ActivityTrigger>
        <ActivityContent>
          <ActivityDetail>
            <ActivityDetailLabel>Applied</ActivityDetailLabel>
            <ActivityDetailContent>
              {generation.paintedTokens.length === 0 ? "Waiting for the first token…" : paintedSummary(generation.paintedTokens)}
            </ActivityDetailContent>
          </ActivityDetail>
          {generation.skin ? (
            <ActivityDetail>
              <ActivityDetailLabel>Skin</ActivityDetailLabel>
              <ActivityDetailContent>{generation.skin}</ActivityDetailContent>
            </ActivityDetail>
          ) : null}
          {generation.typeface ? (
            <ActivityDetail>
              <ActivityDetailLabel>Typeface</ActivityDetailLabel>
              <ActivityDetailContent>{generation.typeface}</ActivityDetailContent>
            </ActivityDetail>
          ) : null}
          {generation.knobs.length > 0 ? (
            <ActivityDetail>
              <ActivityDetailLabel>Component details</ActivityDetailLabel>
              <ActivityDetailContent>{generation.knobs.join("\n")}</ActivityDetailContent>
            </ActivityDetail>
          ) : null}
          {generation.adjustments.length > 0 ? (
            <ActivityDetail>
              <ActivityDetailLabel>Corrected for AA contrast</ActivityDetailLabel>
              <ActivityDetailContent>{generation.adjustments.map(adjustmentLine).join("\n")}</ActivityDetailContent>
            </ActivityDetail>
          ) : null}
          {generation.error ? (
            <ActivityDetail>
              <ActivityDetailLabel>Error</ActivityDetailLabel>
              <ActivityDetailContent className="text-destructive-text">{generation.error}</ActivityDetailContent>
            </ActivityDetail>
          ) : null}
        </ActivityContent>
      </Activity>
    </div>
  );
}
