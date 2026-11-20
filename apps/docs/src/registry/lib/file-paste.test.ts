import { describe, expect, test } from "bun:test";

import { isFilePaste } from "./file-paste";

const screenshot = new File(["binary"], "image.png", { type: "image/png" });

function clipboard(types: string[], text = "", files: File[] = [screenshot]) {
  return { types, files, getData: (type: string) => (type === "text/plain" ? text : "") } as unknown as DataTransfer;
}

describe("file paste", () => {
  test("a screenshot alone is an attachment", () => {
    expect(isFilePaste(clipboard(["Files"]))).toBe(true);
  });

  test("an image whose text is its own path, as CleanShot copies it, is an attachment", () => {
    const path = "/Users/me/Library/Application Support/CleanShot/media/CleanShot 2026-11-20 at 10.20.47 AM@2x.png";
    expect(isFilePaste(clipboard(["Files", "text/plain"], path))).toBe(true);
  });

  test("files whose text is their file URLs or home paths are attachments", () => {
    expect(isFilePaste(clipboard(["Files", "text/plain"], "file:///tmp/a%20b.png\n~/Desktop/c.jpg"))).toBe(true);
  });

  test("a file whose text is its name, as Finder copies it, is an attachment", () => {
    const report = new File(["%PDF"], "Q3 report.pdf", { type: "application/pdf" });
    expect(isFilePaste(clipboard(["Files", "text/plain"], "Q3 report.pdf", [report]))).toBe(true);
  });

  test("a spreadsheet copy that carries a rendered image stays text", () => {
    expect(isFilePaste(clipboard(["Files", "text/html", "text/plain"], "a\tb"))).toBe(false);
  });

  test("prose that happens to start with a slash stays text", () => {
    expect(isFilePaste(clipboard(["Files", "text/plain"], "/table then a sentence"))).toBe(false);
  });

  test("text without files stays text", () => {
    expect(isFilePaste(clipboard(["text/plain"], "/tmp/a.png", []))).toBe(false);
  });
});
