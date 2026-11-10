import { describe, expect, test } from "bun:test";
import { createEditorSchema } from "./schema";
import { docFromText, serializeDoc, serializeSlice, sliceFromText } from "./serialize";

const schema = createEditorSchema([]);

describe("composer clipboard text", () => {
  test("pasted plain text keeps its blank lines, whatever the line endings", () => {
    const pasted = sliceFromText(schema, "First paragraph\r\n\r\nSecond paragraph\rThird line");
    expect(serializeSlice(pasted)).toBe("First paragraph\n\nSecond paragraph\nThird line");
  });

  test("text pasted mid-line joins the line around it", () => {
    const draft = docFromText(schema, "ab");
    const pasted = draft.replace(2, 2, sliceFromText(schema, "X\n\nY"));
    expect(serializeDoc(pasted)).toBe("aX\n\nYb");
  });

  test("copied text is the text the composer would send", () => {
    const draft = docFromText(schema, "one\ntwo\n\nthree");
    expect(serializeSlice(draft.slice(0, draft.content.size))).toBe(serializeDoc(draft));
    expect(serializeDoc(draft)).toBe("one\ntwo\n\nthree");
  });
});
