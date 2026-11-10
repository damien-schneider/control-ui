import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ChatComposer, ChatComposerShell, ChatComposerSubmit, ChatComposerTextarea } from "@/components/control-ui/chat-composer";
import { ChatComposerEditor } from "./chat-composer-editor";

describe("composer input contract", () => {
  test("a child cannot enable an input or submit button while its composer is disabled", () => {
    const html = renderToStaticMarkup(
      <ChatComposer defaultValue="Keep this draft" state="disabled">
        <ChatComposerShell>
          <ChatComposerTextarea disabled={false} aria-label="Follow-up message" />
          <ChatComposerSubmit disabled={false} />
        </ChatComposerShell>
      </ChatComposer>,
    );
    expect(html).toMatch(/<textarea[^>]*aria-label="Follow-up message"[^>]*disabled=""/);
    expect(html).toMatch(/<button[^>]*disabled=""/);
    expect(html).toContain("Keep this draft");
  });

  // Disabling the focused control on send would drop focus to <body>, so submitting only locks the textarea and the button.
  test("a submitting composer keeps its textarea and submit button focusable but blocks a second send", () => {
    const html = renderToStaticMarkup(
      <ChatComposer defaultValue="Keep this draft" state="submitting">
        <ChatComposerShell>
          <ChatComposerTextarea aria-label="Follow-up message" />
          <ChatComposerSubmit />
        </ChatComposerShell>
      </ChatComposer>,
    );
    expect(html).toMatch(/<textarea[^>]*readOnly=""/);
    expect(html).not.toMatch(/<textarea[^>]*disabled=""/);
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*aria-disabled="true"|<button[^>]*aria-disabled="true"[^>]*type="submit"/);
    expect(html).not.toMatch(/<button[^>]*\sdisabled=""/);
  });

  test("with onStop, the same submit button becomes an enabled Stop button while submitting", () => {
    const html = renderToStaticMarkup(
      <ChatComposer defaultValue="Keep this draft" state="submitting">
        <ChatComposerShell>
          <ChatComposerSubmit onStop={() => {}} />
        </ChatComposerShell>
      </ChatComposer>,
    );
    expect(html).toMatch(/<button[^>]*type="button"/);
    expect(html).not.toMatch(/<button[^>]*disabled=""/);
    expect(html).toContain("Stop response");
  });

  test("a Stop button is named by its Stop label, never by the Send label it replaced", () => {
    const withText = renderToStaticMarkup(
      <ChatComposer defaultValue="Keep this draft" state="submitting">
        <ChatComposerShell>
          <ChatComposerSubmit aria-label="Send message" onStop={() => {}}>
            Send
          </ChatComposerSubmit>
        </ChatComposerShell>
      </ChatComposer>,
    );
    expect(withText).toContain("Stop response");
    expect(withText).not.toContain("aria-label=");

    const iconOnly = renderToStaticMarkup(
      <ChatComposer defaultValue="Keep this draft" state="submitting">
        <ChatComposerShell>
          <ChatComposerSubmit iconOnly aria-label="Send message" onStop={() => {}} />
        </ChatComposerShell>
      </ChatComposer>,
    );
    expect(iconOnly).toContain('aria-label="Stop response"');
    expect(iconOnly).not.toContain('aria-label="Send message"');
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
