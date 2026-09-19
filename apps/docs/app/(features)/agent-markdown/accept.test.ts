import { describe, expect, it } from "bun:test";
import { prefersMarkdown } from "./accept";

describe("markdown content negotiation", () => {
  it("serves HTML to browsers", () => {
    expect(prefersMarkdown("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")).toBe(false);
    expect(prefersMarkdown(null)).toBe(false);
  });

  it("serves markdown when an agent asks for it", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/markdown, text/html;q=0.5")).toBe(true);
  });

  it("follows the weaker q value when both are offered", () => {
    expect(prefersMarkdown("text/markdown;q=0.5, text/html;q=0.9")).toBe(false);
    expect(prefersMarkdown("text/markdown;q=0.9, text/html;q=0.5")).toBe(true);
    expect(prefersMarkdown("text/markdown;q=0, text/html;q=0")).toBe(false);
  });
});
