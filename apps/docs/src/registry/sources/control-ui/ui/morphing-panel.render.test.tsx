import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { MorphingPanel, MorphingPanelContent, MorphingPanelTrigger } from "./morphing-panel";

const collapsedSize = { width: "132px", height: "52px" };
const expandedSize = { width: "320px", height: "240px" };

describe("MorphingPanel", () => {
  test("renders accessible closed anatomy with explicit dimensions", () => {
    const html = renderToString(
      <MorphingPanel collapsedSize={collapsedSize} expandedSize={expandedSize}>
        <MorphingPanelTrigger>Open settings</MorphingPanelTrigger>
        <MorphingPanelContent keepMounted>Settings interface</MorphingPanelContent>
      </MorphingPanel>,
    );

    expect(html).toContain('data-control-ui="morphing-panel"');
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-slot="trigger"');
    expect(html).toContain('data-slot="content"');
    expect(html).toContain('data-state="closed"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("--morphing-panel-collapsed-width:132px");
    expect(html).toContain("--morphing-panel-collapsed-height:52px");
    expect(html).toContain("--morphing-panel-expanded-width:320px");
    expect(html).toContain("--morphing-panel-expanded-height:240px");
  });

  test("supports controlled and initially open disclosure state", () => {
    const controlled = renderToString(
      <MorphingPanel open collapsedSize={collapsedSize} expandedSize={{ width: "320px", height: "188px" }}>
        <MorphingPanelTrigger>Close settings</MorphingPanelTrigger>
        <MorphingPanelContent>Settings interface</MorphingPanelContent>
      </MorphingPanel>,
    );
    const uncontrolled = renderToString(
      <MorphingPanel defaultOpen collapsedSize={collapsedSize} expandedSize={expandedSize}>
        <MorphingPanelTrigger>Close settings</MorphingPanelTrigger>
        <MorphingPanelContent>Settings interface</MorphingPanelContent>
      </MorphingPanel>,
    );

    expect(controlled).toContain('data-state="open"');
    expect(controlled).toContain('aria-expanded="true"');
    expect(controlled).toContain("--morphing-panel-expanded-height:188px");
    expect(uncontrolled).toContain('data-state="open"');
    expect(uncontrolled).toContain('aria-expanded="true"');
  });
});
