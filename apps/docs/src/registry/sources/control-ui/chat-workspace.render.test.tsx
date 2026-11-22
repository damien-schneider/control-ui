import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ChatWorkspace,
  ChatWorkspaceCollapsible,
  ChatWorkspaceDockToggle,
  ChatWorkspaceExpandToggle,
  ChatWorkspaceInset,
  ChatWorkspaceMain,
  ChatWorkspacePanel,
  type ChatWorkspaceProps,
  ChatWorkspaceResizeHandle,
  useChatWorkspace,
} from "./chat-workspace";

function workspace(props: ChatWorkspaceProps = {}) {
  return renderToStaticMarkup(
    <ChatWorkspace {...props}>
      <ChatWorkspaceMain>
        <p>Canvas</p>
        <ChatWorkspaceInset />
      </ChatWorkspaceMain>
      <ChatWorkspacePanel>
        <ChatWorkspaceExpandToggle />
        <ChatWorkspaceDockToggle />
        <ChatWorkspaceCollapsible>
          <p>Transcript</p>
        </ChatWorkspaceCollapsible>
        <ChatWorkspaceResizeHandle />
      </ChatWorkspacePanel>
    </ChatWorkspace>,
  );
}

function tag(html: string, pattern: RegExp) {
  const found = pattern.exec(html)?.[0];
  if (!found) throw new Error(`No tag matches ${pattern}`);
  return found;
}

const root = /<div[^>]*data-control-family="chat-workspace"[^>]*data-slot="root"[^>]*>/;
const panel = /<aside[^>]*>/;
const collapsible = /<div[^>]*data-slot="collapsible"[^>]*>/;
const expandToggle = /<button[^>]*aria-label="Conversation"[^>]*>/;
const dockToggle = /<button[^>]*aria-label="(?:Pin to side|Float)"[^>]*>/;
const handle = /<div[^>]*data-slot="resize-handle"[^>]*>/;

function attribute(element: string, name: string) {
  return new RegExp(` ${name}="([^"]*)"`).exec(element)?.[1];
}

describe("ChatWorkspace", () => {
  test("floats by default: an expanded island on the right side, offering to pin itself", () => {
    const html = workspace();
    const rootTag = tag(html, root);
    expect(rootTag).not.toContain("data-docked");
    expect(attribute(rootTag, "data-side")).toBe("right");
    expect(rootTag).toContain("data-expanded");

    const panelTag = tag(html, panel);
    expect(attribute(panelTag, "aria-label")).toBe("Chat");

    const region = tag(html, collapsible);
    expect(region).not.toContain("inert");
    const toggle = tag(html, expandToggle);
    expect(attribute(toggle, "aria-expanded")).toBe("true");
    expect(attribute(toggle, "aria-controls")).toBe(attribute(region, "id"));

    expect(attribute(tag(html, dockToggle), "aria-label")).toBe("Pin to side");
    expect(html).not.toMatch(handle);
  });

  test("a collapsed island keeps its transcript out of reach", () => {
    const html = workspace({ defaultExpanded: false });
    expect(tag(html, root)).not.toContain("data-expanded");
    expect(tag(html, collapsible)).toContain("inert");
    expect(attribute(tag(html, expandToggle), "aria-expanded")).toBe("false");
  });

  test("docked, the panel is a side column of its width, always expanded, with a resize separator", () => {
    const html = workspace({ defaultDocked: true, defaultExpanded: false, defaultPanelWidth: 420 });
    expect(tag(html, root)).toContain("data-docked");
    expect(tag(html, root)).toContain("data-expanded");
    expect(tag(html, collapsible)).not.toContain("inert");
    expect(html).not.toMatch(expandToggle);
    expect(attribute(tag(html, dockToggle), "aria-label")).toBe("Float");

    const panelTag = tag(html, panel);
    expect(attribute(panelTag, "style")).toContain("inline-size:420px");

    const separator = tag(html, handle);
    expect(attribute(separator, "role")).toBe("separator");
    expect(attribute(separator, "aria-orientation")).toBe("vertical");
    expect(attribute(separator, "aria-valuenow")).toBe("420");
    expect(attribute(separator, "aria-valuemin")).toBe("288");
    expect(attribute(separator, "aria-valuemax")).toBe("640");
    expect(attribute(separator, "aria-controls")).toBe(attribute(panelTag, "id"));
    expect(attribute(separator, "tabindex")).toBe("0");
    expect(attribute(separator, "aria-label")).toBe("Resize chat panel");
  });

  test("a requested width is clamped to the panel's bounds", () => {
    const html = workspace({ defaultDocked: true, defaultPanelWidth: 2000, maxPanelWidth: 560 });
    expect(attribute(tag(html, handle), "aria-valuenow")).toBe("560");
    expect(attribute(tag(html, panel), "style")).toContain("inline-size:560px");
  });

  test("the panel can sit on the left", () => {
    expect(attribute(tag(workspace({ side: "left" }), root), "data-side")).toBe("left");
  });

  test("useChatWorkspace exposes the state and refuses to run outside a workspace", () => {
    function State() {
      const { docked, expanded, side } = useChatWorkspace();
      return <output>{`${docked}/${expanded}/${side}`}</output>;
    }
    expect(
      renderToStaticMarkup(
        <ChatWorkspace defaultDocked side="left">
          <State />
        </ChatWorkspace>,
      ),
    ).toContain("true/true/left");
    expect(() => renderToStaticMarkup(<State />)).toThrow("inside <ChatWorkspace>");
  });
});
