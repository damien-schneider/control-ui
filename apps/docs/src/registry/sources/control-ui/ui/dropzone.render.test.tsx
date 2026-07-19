import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";

import {
  Dropzone,
  DropzoneArea,
  DropzoneFileList,
  DropzoneInput,
  DropzoneOverlay,
  DropzoneRejectionList,
  DropzoneStatus,
  DropzoneTrigger,
} from "./dropzone";

function openingTag(html: string, tag: string, slot: string) {
  const match = html.match(
    new RegExp(`<${tag}[^>]*data-control-ui="dropzone"[^>]*data-slot="${slot}"[^>]*>`),
  );
  if (!match) throw new Error(`Missing ${tag}[data-slot="${slot}"]`);
  return match[0];
}

function renderStandardDropzone(props: { disabled?: boolean; value?: readonly File[] } = {}) {
  return renderToString(
    <Dropzone disabled={props.disabled} value={props.value} policy={{ accept: { "image/png": [".png"] } }}>
      <DropzoneInput
        name="attachments"
        required
        capture="environment"
        form="upload-form"
        aria-describedby="attachment-help"
      />
      <DropzoneArea>
        <DropzoneTrigger />
      </DropzoneArea>
      <DropzoneFileList />
      <DropzoneRejectionList />
      <DropzoneStatus />
    </Dropzone>,
  );
}

describe("Dropzone server rendering", () => {
  test("renders idle native controls, bounded area anatomy, and empty lists", () => {
    const html = renderStandardDropzone();
    const root = openingTag(html, "div", "root");
    const input = openingTag(html, "input", "input");
    const area = openingTag(html, "div", "area");
    const trigger = openingTag(html, "button", "trigger");
    const fileList = openingTag(html, "ul", "file-list");
    const rejectionList = openingTag(html, "ul", "rejection-list");
    const status = openingTag(html, "div", "status");

    expect(root).toContain('data-empty="true"');
    expect(root).not.toContain("aria-busy");
    expect(area).toContain('data-state="idle"');
    expect(area).toContain('aria-busy="false"');
    expect(input).toContain('type="file"');
    expect(input).toContain('aria-label="Choose files"');
    expect(input).toContain('accept=".png"');
    expect(input).toContain("multiple");
    expect(input).toContain('name="attachments"');
    expect(input).toContain("required");
    expect(input).toContain('capture="environment"');
    expect(input).toContain('form="upload-form"');
    expect(input).toContain('aria-describedby="attachment-help"');
    expect(trigger).toContain('type="button"');
    expect(trigger).not.toMatch(/\sdisabled=""/);
    expect(html).toContain("Drop files here or choose files.");
    expect(fileList).toContain("hidden");
    expect(fileList).toContain('aria-label="Selected files"');
    expect(fileList).toContain('data-empty="true"');
    expect(rejectionList).toContain("hidden");
    expect(rejectionList).toContain('aria-label="Rejected files"');
    expect(status).toContain('role="status"');
    expect(status).toContain('aria-live="polite"');
    expect(html).toContain("No files selected.");
  });

  test("propagates disabled state to root, area, input, and trigger", () => {
    const html = renderStandardDropzone({ disabled: true });
    const root = openingTag(html, "div", "root");
    const input = openingTag(html, "input", "input");
    const area = openingTag(html, "div", "area");
    const trigger = openingTag(html, "button", "trigger");

    expect(root).toContain('data-disabled="true"');
    expect(area).toContain('data-disabled="true"');
    expect(input).toMatch(/\sdisabled=""/);
    expect(trigger).toMatch(/\sdisabled=""/);
    expect(trigger).toContain('data-disabled="true"');
  });

  test("renders authoritative controlled files without revalidating them", () => {
    const selected = new File([new Uint8Array(1536)], "already-selected.exe", {
      type: "application/x-msdownload",
      lastModified: 2,
    });
    const html = renderStandardDropzone({ value: [selected] });
    const root = openingTag(html, "div", "root");
    const fileList = openingTag(html, "ul", "file-list");
    const rejectionList = openingTag(html, "ul", "rejection-list");

    expect(root).not.toContain('data-empty="true"');
    expect(fileList).not.toContain("hidden");
    expect(rejectionList).toContain("hidden");
    expect(html).toContain('data-slot="file"');
    expect(html).toContain("already-selected.exe");
    expect(html).toContain("1.5 KB");
    expect(html).toContain('aria-label="Remove already-selected.exe"');
    expect(html).toContain("1 file selected.");
    expect(html).not.toContain("File type is not accepted.");
  });

  test("keeps a global overlay mounted, inactive, and hidden from assistive technology", () => {
    const html = renderToString(
      <Dropzone>
        <DropzoneInput />
        <DropzoneArea>
          <section>
            Workspace
            <DropzoneOverlay scope="global" />
          </section>
        </DropzoneArea>
        <DropzoneFileList />
        <DropzoneRejectionList />
        <DropzoneStatus />
      </Dropzone>,
    );
    const overlay = openingTag(html, "div", "overlay");

    expect(overlay).toContain('aria-hidden="true"');
    expect(overlay).toContain('data-state="idle"');
    expect(overlay).toContain('data-scope="global"');
    expect(overlay).not.toContain("data-active");
    expect(html).toContain("Workspace");
  });

  test("throws the exact context error outside Dropzone", () => {
    expect(() => renderToString(<DropzoneStatus />)).toThrow(
      "Dropzone parts must be used inside Dropzone.",
    );
  });
});
