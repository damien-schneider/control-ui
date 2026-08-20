import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import type { ContextSegment } from "@/components/control-ui/contracts";
import { Context, ContextGraph, ContextLegend, ContextSummary } from "./context";

const segments = [
  { id: "system", label: "System prompt", tokens: 12_000, kind: "system" },
  { id: "tools", label: "Tools", tokens: 18_000, kind: "tool" },
  { id: "messages", label: "Messages", tokens: 52_000, kind: "message" },
  { id: "sources", label: "Sources", tokens: 8_000, kind: "source" },
  { id: "reasoning", label: "Reasoning", tokens: 10_000, kind: "reasoning" },
] satisfies ContextSegment[];

describe("Context", () => {
  test("server-renders one compact accessible trigger without opening the popup", () => {
    const html = renderToStaticMarkup(<Context segments={segments} maxTokens={200_000} model="GPT-5" />);

    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Context window: 100,000 of 200,000 tokens used (50%)"');
    expect(html).toContain("50% context");
    expect(html).toContain('data-control-ui="context" data-control-family="context" data-slot="root"');
    expect(html).toContain('data-control-ui="context" data-control-family="context" data-slot="trigger"');
    expect(html).toContain('data-control-ui="context" data-control-family="context" data-slot="trigger-indicator"');
    expect(html).toContain('data-control-ui="context" data-control-family="context" data-slot="trigger-label"');
    expect(html).not.toContain('data-control-ui="popover" data-slot="content"');
    expect(html).not.toContain("Context window</");
  });

  test("derives the complete graph, legend, and available capacity from segments", () => {
    const html = renderToStaticMarkup(
      <Context segments={segments} maxTokens={200_000} model="GPT-5">
        <ContextSummary />
        <ContextGraph />
        <ContextLegend />
      </Context>,
    );

    expect(html).toContain("50% used");
    expect(html).toContain("100,000 / 200,000 tokens");
    expect(html.match(/data-slot="segment"/g)).toHaveLength(5);
    expect(html.match(/data-slot="legend-item"/g)).toHaveLength(6);
    for (const label of ["System prompt", "Tools", "Messages", "Sources", "Reasoning"]) {
      expect(html).toContain(label);
    }
    expect(html).toContain("12,000 tokens · 6%");
    expect(html).toContain("52,000 tokens · 26%");
    expect(html).toContain("Available");
    expect(html).toContain("100,000 tokens · 50%");
  });

  test("renders count-only output when the limit is unavailable", () => {
    const html = renderToStaticMarkup(
      <Context segments={[{ id: "messages", label: "Messages", tokens: 12_000 }]}>
        <ContextSummary />
        <ContextGraph />
        <ContextLegend />
      </Context>,
    );

    expect(html).toContain('data-status="unavailable"');
    expect(html).toContain("12,000 tokens used");
    expect(html).toContain("Limit unavailable");
    expect(html).toContain("12,000 tokens");
    expect(html).not.toContain("%");
    expect(html).not.toContain('data-slot="limit-marker"');
  });

  test("keeps over-limit percentages and counts uncapped", () => {
    const html = renderToStaticMarkup(
      <Context
        segments={[
          { id: "messages", label: "Messages", tokens: 80 },
          { id: "reasoning", label: "Reasoning", tokens: 40, kind: "reasoning" },
        ]}
        maxTokens={100}
      >
        <ContextSummary />
        <ContextGraph />
        <ContextLegend />
      </Context>,
    );

    expect(html).toContain('data-status="over-limit"');
    expect(html).toContain("120% used");
    expect(html).toContain("120 / 100 tokens");
    expect(html).toContain('data-slot="limit-marker"');
    expect(html).toContain("20 tokens over limit");
  });
});
