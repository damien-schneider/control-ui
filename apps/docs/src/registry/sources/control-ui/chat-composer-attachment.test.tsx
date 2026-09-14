import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ChatComposerAttachment } from "./chat-composer-attachment";

describe("attachment upload progress", () => {
  test("reports known progress and reveals the uploaded portion of the content", () => {
    const html = renderToStaticMarkup(<ChatComposerAttachment name="report.pdf" status="uploading" progress={64} />);
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-label="Uploading report.pdf"');
    expect(html).toContain('aria-valuenow="64"');
    expect(html).toContain("inline-size:36%");
    expect(html).not.toContain('data-control-family="spinner"');
  });

  test("unknown progress stays indeterminate rather than reporting zero", () => {
    const html = renderToStaticMarkup(<ChatComposerAttachment name="report.pdf" status="uploading" />);
    expect(html).toContain('role="progressbar"');
    expect(html).not.toContain("aria-valuenow");
    expect(html).not.toContain("Uploading 0%");
    expect(html).toContain('data-control-family="spinner"');
  });

  test("completion and failure clear the veil even when the host retains its last progress value", () => {
    for (const status of ["uploaded", "error"] as const) {
      const html = renderToStaticMarkup(<ChatComposerAttachment name="report.pdf" status={status} progress={64} />);
      expect(html).not.toContain('role="progressbar"');
      if (status === "error") expect(html).toContain("Upload failed");
    }
  });
});
