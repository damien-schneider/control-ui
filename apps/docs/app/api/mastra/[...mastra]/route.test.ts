import { expect, test } from "bun:test";

import { CHAT_PREVIEW_AGENT_ID, CHAT_PREVIEW_REPLY } from "@/mastra/chat-preview-contract";
import { POST } from "./route";

function sseEvents(body: string) {
  return body
    .split("\n\n")
    .map((record) => record.trim())
    .filter((record) => record.startsWith("data: ") && record !== "data: [DONE]")
    .map((record) => JSON.parse(record.slice("data: ".length)) as { type: string; payload?: { text?: string } });
}

test("streams the built-in Mastra mock through the preview route", async () => {
  const response = await POST(
    new Request(`http://127.0.0.1:3000/api/mastra/agents/${CHAT_PREVIEW_AGENT_ID}/stream`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "Show the preview stream" }] }),
    }),
  );

  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toContain("text/event-stream");

  const events = sseEvents(await response.text());
  const textDeltas = events.filter((event) => event.type === "text-delta");
  const finishIndex = events.findIndex((event) => event.type === "finish");
  const lastTextDeltaIndex = events.findLastIndex((event) => event.type === "text-delta");

  expect(textDeltas.length).toBeGreaterThan(1);
  expect(textDeltas.map((event) => event.payload?.text ?? "").join("")).toBe(CHAT_PREVIEW_REPLY);
  expect(finishIndex).toBeGreaterThan(lastTextDeltaIndex);
});
