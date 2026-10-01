import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { InlineAttachment, InlineAttachmentDescription, InlineAttachmentMedia } from "./inline-attachment";

describe("InlineAttachment", () => {
  test("a pending attachment stays focusable but inert and announces itself as busy", () => {
    const html = renderToString(
      <InlineAttachment name="app-icon.png" state="pending">
        <InlineAttachmentMedia />
      </InlineAttachment>,
    );

    expect(html).toContain('data-state="pending"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toContain('disabled=""');
    expect(html).toContain('aria-label="Generating app-icon.png"');
    expect(html).toContain('data-slot="placeholder"');
  });

  test("a pending attachment shows the loader instead of arrived media", () => {
    const html = renderToString(
      <InlineAttachment name="app-icon.png" state="pending">
        <InlineAttachmentMedia src="https://example.com/icon.png" />
      </InlineAttachment>,
    );

    expect(html).not.toContain("<img");
  });

  test("reserves the final box so arriving media does not reflow the turn", () => {
    const html = renderToString(
      <InlineAttachment name="app-icon.png" state="pending" aspect={1}>
        <InlineAttachmentMedia />
      </InlineAttachment>,
    );

    expect(html).toContain("aspect-ratio:1");
  });

  test("a ready attachment stays openable and renders its media", () => {
    const html = renderToString(
      <InlineAttachment name="note.jpeg">
        <InlineAttachmentMedia src="https://example.com/note.jpeg" />
      </InlineAttachment>,
    );

    expect(html).toContain('aria-label="Open attachment: note.jpeg"');
    expect(html).not.toContain("aria-busy");
    expect(html).not.toContain('disabled=""');
    expect(html).toContain('src="https://example.com/note.jpeg"');
  });

  test("the button is described by its visible description", () => {
    const html = renderToString(
      <InlineAttachment name="note.jpeg">
        <InlineAttachmentDescription>Uploaded 2m ago</InlineAttachmentDescription>
      </InlineAttachment>,
    );

    const describedBy = html.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(describedBy).toBeDefined();
    expect(html).toContain(`id="${describedBy}"`);
  });
});
