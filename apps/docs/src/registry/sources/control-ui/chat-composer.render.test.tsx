import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ChatComposer, ChatComposerShell, ChatComposerSubmit, ChatComposerTextarea } from "@/components/control-ui/chat-composer";
import { ChatComposerEditor } from "./chat-composer-editor";

describe("composer input contract", () => {
  test("a child cannot enable an input or submit button while its composer is disabled", () => {
    for (const state of ["submitting", "disabled"] as const) {
      const html = renderToStaticMarkup(
        <ChatComposer defaultValue="Keep this draft" state={state}>
          <ChatComposerShell>
            <ChatComposerTextarea disabled={false} aria-label="Follow-up message" />
            <ChatComposerSubmit disabled={false} />
          </ChatComposerShell>
        </ChatComposer>,
      );
      expect(html).toMatch(/<textarea[^>]*aria-label="Follow-up message"[^>]*disabled=""/);
      expect(html).toMatch(/<button[^>]*disabled=""/);
      expect(html).toContain("Keep this draft");
    }
  });

  test("the rich editor forwards its style and renders a disabled fallback before mounting", () => {
    const html = renderToStaticMarkup(
      <ChatComposer disabled defaultValue="Keep this draft">
        <ChatComposerShell>
          <ChatComposerEditor style={{ "--cui-chat-composer-input-foreground": "oklch(0.6 0.1 250)" }} />
        </ChatComposerShell>
      </ChatComposer>,
    );
    expect(html).toContain("--cui-chat-composer-input-foreground:oklch(0.6 0.1 250)");
    expect(html).toMatch(/<textarea[^>]*disabled=""/);
    expect(html).toContain("Keep this draft");
  });
});
