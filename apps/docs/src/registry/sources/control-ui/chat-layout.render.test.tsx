import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { ChatThought } from "./chat-layout";

describe("ChatThought", () => {
  test("keeps its public API while composing the shared activity disclosure", () => {
    const html = renderToString(
      <ChatThought defaultOpen details="Read the source and checked the rendered output.">
        Thinking
      </ChatThought>,
    );

    expect(html).toContain('data-control-ui="chat-thought"');
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-slot="trigger"');
    expect(html).toContain('data-slot="details"');
    expect(html).toContain('data-slot="content-viewport"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain("Read the source and checked the rendered output.");
  });
});
