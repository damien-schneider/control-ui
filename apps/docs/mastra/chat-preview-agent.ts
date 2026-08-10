import type { MastraLanguageModel } from "@mastra/core/agent";
import { Agent } from "@mastra/core/agent";
import { simulateReadableStream } from "ai";

import { CHAT_PREVIEW_AGENT_ID, CHAT_PREVIEW_REPLY } from "./chat-preview-contract";

const replyDeltas = CHAT_PREVIEW_REPLY.match(/\S+\s*/g) ?? [CHAT_PREVIEW_REPLY];
const textPartId = "chat-preview-text";

const streamCannedReply = () => ({
  stream: simulateReadableStream({
    initialDelayInMs: 180,
    chunkDelayInMs: 45,
    chunks: [
      { type: "stream-start" as const, warnings: [] },
      {
        type: "response-metadata" as const,
        id: "chat-preview-response",
        modelId: "built-in-mock",
        timestamp: new Date(0),
      },
      { type: "text-start" as const, id: textPartId },
      ...replyDeltas.map((delta) => ({ type: "text-delta" as const, id: textPartId, delta })),
      { type: "text-end" as const, id: textPartId },
      {
        type: "finish" as const,
        finishReason: "stop" as const,
        usage: {
          inputTokens: 8,
          outputTokens: replyDeltas.length,
          totalTokens: 8 + replyDeltas.length,
        },
      },
    ],
  }),
});

const chatPreviewModel: MastraLanguageModel = {
  specificationVersion: "v2",
  provider: "mastra-preview",
  modelId: "built-in-mock",
  supportedUrls: {},
  doGenerate: async () => streamCannedReply(),
  doStream: async () => streamCannedReply(),
};

export const chatPreviewAgent = new Agent({
  id: CHAT_PREVIEW_AGENT_ID,
  name: "Chat preview",
  instructions: "Return the configured preview response.",
  model: chatPreviewModel,
});
