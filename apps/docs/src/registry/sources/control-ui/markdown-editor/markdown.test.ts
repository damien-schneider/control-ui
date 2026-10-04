import { describe, expect, test } from "bun:test";
import { getSchema } from "@tiptap/core";
import { createMarkdownCodec, hasMarkdownContent, isEditorUrl, markdownExtensions, requiresMarkdownSource } from "./extensions";

const codec = createMarkdownCodec();
const corpus = [
  "## Project\n\nA **bold**, *italic*, ~~removed~~ and `code` description.",
  "- Parent\n  - Child\n\n1. First\n2. Second",
  "- [x] Shipped\n- [ ] Next\n  - [x] Nested",
  "> A quote\n>\n> With two paragraphs.",
  "```ts\nconst value = '<script>';\nconsole.log(value);\n```",
  '[Example](https://example.com/a?q=1&b=2) and ![Screenshot](https://example.com/image.png "Caption")',
  "| Left | Right |\n| :--- | ---: |\n| **A** | `B` |",
  "A hard break  \nnext line\n\nA new paragraph",
  "Escaped \\*stars\\* and <https://example.com>",
  "![Relative screenshot](/media/screenshot.png)",
  "---\n\nText after a rule.",
];

describe("Markdown storage contract", () => {
  test.each(corpus)("preserves document structure through save and reopen: %s", (markdown) => {
    const parsed = codec.parse(markdown);
    expect(() => getSchema(markdownExtensions()).nodeFromJSON(parsed).check()).not.toThrow();
    const stored = codec.serialize(parsed);
    expect(codec.parse(stored)).toEqual(parsed);
    expect(requiresMarkdownSource(stored, codec)).toBe(false);
  });

  test("keeps HTML and unsafe media in source mode instead of discarding content", () => {
    for (const markdown of ["<details><summary>More</summary>Hidden</details>", "![Local](blob:temporary)", "[Bad](javascript:alert)"]) {
      expect(requiresMarkdownSource(markdown, codec)).toBe(true);
    }
  });

  test("only persistent, safe URLs can be inserted", () => {
    for (const url of [
      "javascript:alert(1)",
      "data:image/png;base64,AAAA",
      "blob:temporary",
      "//external.example/x",
      "/\\external",
      "https:\n//x.test",
    ]) {
      expect(isEditorUrl(url, true)).toBe(false);
    }
    expect(isEditorUrl("https://example.com/a.png", true)).toBe(true);
    expect(isEditorUrl("/media/a.png", true)).toBe(true);
    expect(isEditorUrl("mailto:hello@example.com")).toBe(true);
    expect(isEditorUrl("mailto:hello@example.com", true)).toBe(false);
  });

  test("images count as content, empty task lists and upload placeholders do not", () => {
    expect(hasMarkdownContent(codec.parse("![Screenshot](/media/a.png)"))).toBe(true);
    expect(hasMarkdownContent(codec.parse("- [ ] "))).toBe(false);
    expect(hasMarkdownContent({ type: "doc", content: [{ type: "imageUpload", attrs: { id: "pending" } }] })).toBe(false);
    expect(codec.serialize({ type: "doc", content: [{ type: "imageUpload", attrs: { id: "pending" } }] })).not.toContain("pending");
  });
});

test("image filenames, captions and parentheses do not break Markdown on reopening", () => {
  const attributes = { src: "https://example.com/a(1).png", alt: "A ] bracket [x]", title: 'A "quoted" caption' };
  const markdown = codec.serialize({ type: "doc", content: [{ type: "paragraph", content: [{ type: "image", attrs: attributes }] }] });
  expect(codec.parse(markdown).content?.[0].content?.[0].attrs).toEqual(attributes);
});
