import { Mastra } from "@mastra/core/mastra";

import { chatPreviewAgent } from "./chat-preview-agent";
import { CHAT_PREVIEW_AGENT_ID } from "./chat-preview-contract";

// The theme generator is deliberately absent: this instance is served by a catch-all that accepts
// caller-supplied messages, model ids and model settings, so any agent registered here is an open,
// unmetered proxy to its provider. The generator is invoked directly from /api/theme instead.
export const previewMastra = new Mastra({
  logger: false,
  agents: { [CHAT_PREVIEW_AGENT_ID]: chatPreviewAgent },
});
