import { Mastra } from "@mastra/core/mastra";

import { chatPreviewAgent } from "./chat-preview-agent";
import { CHAT_PREVIEW_AGENT_ID } from "./chat-preview-contract";

export const previewMastra = new Mastra({
  logger: false,
  agents: {
    [CHAT_PREVIEW_AGENT_ID]: chatPreviewAgent,
  },
});
