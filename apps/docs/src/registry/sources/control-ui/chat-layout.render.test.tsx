import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ChatThread, useChatThread } from "./chat-layout";

function regionTag(html: string) {
  return /<[^>]*role="region"[^>]*>/.exec(html)?.[0];
}

describe("chat thread", () => {
  test("the scroller is a named region by default, and a caller's name replaces the default", () => {
    expect(regionTag(renderToStaticMarkup(<ChatThread />))).toContain('aria-label="Conversation"');

    const labelled = regionTag(renderToStaticMarkup(<ChatThread aria-label="Support chat" />));
    expect(labelled).toContain('aria-label="Support chat"');

    const labelledBy = regionTag(renderToStaticMarkup(<ChatThread aria-labelledby="thread-title" />));
    expect(labelledBy).toContain('aria-labelledby="thread-title"');
    expect(labelledBy).not.toContain("aria-label=");
  });

  test("useChatThread exposes the scroll state to custom controls and rejects use outside a thread", () => {
    function UnreadMarker() {
      const { atBottom } = useChatThread();
      return <output>{atBottom ? "caught up" : "new messages"}</output>;
    }

    const html = renderToStaticMarkup(
      <ChatThread>
        <UnreadMarker />
      </ChatThread>,
    );
    expect(html).toContain("caught up");
    expect(() => renderToStaticMarkup(<UnreadMarker />)).toThrow("inside <ChatThread>");
  });
});
