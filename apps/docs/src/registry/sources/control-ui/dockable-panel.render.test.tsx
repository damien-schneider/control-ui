import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import {
  DockablePanel,
  DockablePanelActions,
  DockablePanelClose,
  DockablePanelContent,
  DockablePanelDock,
  DockablePanelDragHandle,
  DockablePanelHeader,
  DockablePanelTitle,
  DockablePanelToggle,
} from "./ui/dockable-panel";

describe("DockablePanel", () => {
  test("renders non-modal panel anatomy with accessible placement actions", () => {
    const html = renderToString(
      <div className="relative">
        <DockablePanel>
          <DockablePanelHeader>
            <DockablePanelDragHandle>
              <DockablePanelTitle>Inspector</DockablePanelTitle>
            </DockablePanelDragHandle>
            <DockablePanelActions>
              <DockablePanelDock placement="left" />
              <DockablePanelToggle />
              <DockablePanelClose />
            </DockablePanelActions>
          </DockablePanelHeader>
          <DockablePanelContent>Selection details</DockablePanelContent>
        </DockablePanel>
      </div>,
    );

    expect(html).toContain('data-control-ui="dockable-panel"');
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-placement="right"');
    expect(html).toContain('aria-label="Dock panel left"');
    expect(html).toContain('aria-label="Move panel to left"');
    expect(html).toContain('aria-label="Close panel"');
    for (const label of ["Dock panel left", "Move panel to left", "Close panel"]) {
      expect(html).toMatch(
        new RegExp(
          `<button(?=[^>]*data-control-ui="button")(?=[^>]*data-control-family="button")(?=[^>]*data-slot="root")(?=[^>]*data-control="true")(?=[^>]*aria-label="${label}")[^>]*>`,
        ),
      );
    }
    expect(html).not.toContain("drawer-backdrop");
    expect(html).not.toContain('aria-modal="true"');
  });
});
