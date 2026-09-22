import { describe, expect, test } from "bun:test";
import type { ClipboardEvent as ReactClipboardEvent } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { defaultGetFilesFromEvent, type UseDropzoneOptions, type UseDropzoneReturn, useDropzone } from "./use-dropzone";

type FakeClipboardEvent = {
  clipboardData: DataTransfer;
  defaultPrevented: boolean;
  preventDefault: () => void;
  stopPropagation: () => void;
  claimed: () => boolean;
};

function renderDropzone(options: UseDropzoneOptions): UseDropzoneReturn {
  let dropzone: UseDropzoneReturn | undefined;
  function Probe() {
    dropzone = useDropzone(options);
    return null;
  }
  renderToStaticMarkup(<Probe />);
  if (!dropzone) throw new Error("useDropzone did not run");
  return dropzone;
}

function clipboardEvent({
  types,
  files = [],
  items = [],
}: {
  types: string[];
  files?: File[];
  items?: DataTransferItem[];
}): FakeClipboardEvent {
  let prevented = false;
  return {
    clipboardData: { types, files, items } as unknown as DataTransfer,
    defaultPrevented: false,
    preventDefault: () => {
      prevented = true;
    },
    stopPropagation: () => {},
    claimed: () => prevented,
  };
}

function pasteInto(options: UseDropzoneOptions, event: FakeClipboardEvent) {
  const { onPaste } = renderDropzone(options).getRootProps();
  onPaste?.(event as unknown as ReactClipboardEvent<HTMLDivElement>);
  return event.claimed();
}

const screenshot = new File(["binary"], "screenshot.png", { type: "image/png" });

describe("dropzone paste intake", () => {
  test("claims a text-free file paste so a pasted screenshot becomes an attachment", () => {
    expect(pasteInto({}, clipboardEvent({ types: ["Files"], files: [screenshot] }))).toBe(true);
  });

  test("leaves a paste that also carries text to the focused editor", () => {
    expect(pasteInto({}, clipboardEvent({ types: ["text/plain", "text/html", "Files"], files: [screenshot] }))).toBe(false);
  });

  test("ignores a plain text paste", () => {
    expect(pasteInto({}, clipboardEvent({ types: ["text/plain"] }))).toBe(false);
  });

  test("declines every paste once paste intake is switched off", () => {
    expect(pasteInto({ paste: false }, clipboardEvent({ types: ["Files"], files: [screenshot] }))).toBe(false);
  });

  test("declines every paste while disabled", () => {
    expect(pasteInto({ disabled: true }, clipboardEvent({ types: ["Files"], files: [screenshot] }))).toBe(false);
  });
});

describe("clipboard file extraction", () => {
  test("reads the pasted files", () => {
    const event = clipboardEvent({ types: ["Files"], files: [screenshot] });
    expect(defaultGetFilesFromEvent(event as unknown as ReactClipboardEvent<HTMLDivElement>)).toEqual([screenshot]);
  });

  test("falls back to clipboard items, which is all Safari exposes for a pasted screenshot", () => {
    const fileItem = { kind: "file", getAsFile: () => screenshot } as unknown as DataTransferItem;
    const stringItem = { kind: "string", getAsFile: () => null } as unknown as DataTransferItem;
    const event = clipboardEvent({ types: ["Files"], items: [stringItem, fileItem] });
    expect(defaultGetFilesFromEvent(event as unknown as ReactClipboardEvent<HTMLDivElement>)).toEqual([screenshot]);
  });
});
