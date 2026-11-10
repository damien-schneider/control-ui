import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger } from "./sidebar";

function triggerTag(html: string) {
  return html.match(/<button[^>]+data-slot="trigger"[^>]*>/)?.[0] ?? "";
}

function sidebarTag(html: string) {
  const controlledId = triggerTag(html).match(/aria-controls="([^"]+)"/)?.[1];
  const at = html.indexOf(`id="${controlledId}"`);
  return at < 0 ? "" : html.slice(html.lastIndexOf("<", at), html.indexOf(">", at) + 1);
}

describe("SidebarTrigger", () => {
  test("keeps the ghost default and honors a consumer variant", () => {
    const defaultTrigger = triggerTag(
      renderToStaticMarkup(
        <SidebarProvider persistOpen={false}>
          <SidebarTrigger />
        </SidebarProvider>,
      ),
    );
    const surfaceTrigger = triggerTag(
      renderToStaticMarkup(
        <SidebarProvider persistOpen={false}>
          <SidebarTrigger variant="surface" />
        </SidebarProvider>,
      ),
    );

    expect(defaultTrigger).toContain('data-variant="ghost"');
    expect(surfaceTrigger).toContain('data-variant="surface"');
  });

  test.each(["offcanvas", "icon", "none"] as const)("controls a rendered sidebar when collapsible is %s", (collapsible) => {
    const html = renderToStaticMarkup(
      <SidebarProvider persistOpen={false}>
        <Sidebar collapsible={collapsible}>
          <SidebarContent />
        </Sidebar>
        <SidebarInset>
          <SidebarTrigger />
        </SidebarInset>
      </SidebarProvider>,
    );
    const controlledId = triggerTag(html).match(/aria-controls="([^"]+)"/)?.[1];

    expect(controlledId).toBeDefined();
    expect(html).toContain(`id="${controlledId}"`);
  });
});

describe("Sidebar landmark", () => {
  test.each(["offcanvas", "icon", "none"] as const)("is a complementary region named by label when collapsible is %s", (collapsible) => {
    const sidebar = sidebarTag(
      renderToStaticMarkup(
        <SidebarProvider persistOpen={false}>
          <Sidebar collapsible={collapsible} label="Workspace">
            <SidebarContent />
          </Sidebar>
          <SidebarInset>
            <SidebarTrigger />
          </SidebarInset>
        </SidebarProvider>,
      ),
    );

    expect(sidebar).toContain('role="complementary"');
    expect(sidebar).toContain('aria-label="Workspace"');
  });

  test("adds no landmark inside a contained layout", () => {
    const sidebar = sidebarTag(
      renderToStaticMarkup(
        <SidebarProvider persistOpen={false} layout="contained">
          <Sidebar label="Workspace">
            <SidebarContent />
          </Sidebar>
          <SidebarInset>
            <SidebarTrigger />
          </SidebarInset>
        </SidebarProvider>,
      ),
    );

    expect(sidebar).not.toBe("");
    expect(sidebar).not.toContain("role=");
    expect(sidebar).not.toContain("aria-label=");
  });
});
