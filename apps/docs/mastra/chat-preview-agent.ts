import { Agent } from "@mastra/core/agent";
import { MastraLanguageModelV2Mock, simulateReadableStream } from "@mastra/core/test-utils/llm-mock";

import { CHAT_PREVIEW_AGENT_ID, CHAT_PREVIEW_REPLY } from "./chat-preview-contract";

const replyDeltas = CHAT_PREVIEW_REPLY.match(/\S+\s*/g) ?? [CHAT_PREVIEW_REPLY];
const textPartId = "chat-preview-text";

const chatPreviewModel = new MastraLanguageModelV2Mock({
  provider: "mastra-preview",
  modelId: "built-in-mock",
  doStream: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    warnings: [],
    stream: simulateReadableStream({
      initialDelayInMs: 180,
      chunkDelayInMs: 45,
      chunks: [
        { type: "stream-start", warnings: [] },
        {
          type: "response-metadata",
          id: "chat-preview-response",
          modelId: "built-in-mock",
          timestamp: new Date(0),
        },
        { type: "text-start", id: textPartId },
        ...replyDeltas.map((delta) => ({ type: "text-delta", id: textPartId, delta })),
        { type: "text-end", id: textPartId },
        {
          type: "finish",
          finishReason: "stop",
          usage: {
            inputTokens: 8,
            outputTokens: replyDeltas.length,
            totalTokens: 8 + replyDeltas.length,
          },
        },
      ],
    }),
  }),
});

export const chatPreviewAgent = new Agent({
  id: CHAT_PREVIEW_AGENT_ID,
  name: "Chat preview",
  instructions: "Return the configured preview response.",
  model: chatPreviewModel,
});
