import { describe, expect, test } from "bun:test";
import type { SearchItem } from "@/app/(features)/model/types";
import { matchSearchItems } from "@/app/(features)/registry-api/search";

const items = [
  {
    id: "agent-surface",
    name: "Agent surface",
    kind: "Guide",
    summary: "Agent-readable API, CLI command access, and registry search.",
    href: "/agent-surface",
  },
  {
    id: "command",
    name: "Command",
    kind: "Primitive",
    summary: "Command palette with token-matched dialog, input, and result rows.",
    href: "/primitives/command",
  },
  {
    id: "combobox",
    name: "Combobox",
    kind: "Primitive",
    summary: "Searchable single-select with input and floating option list.",
    href: "/primitives/combobox",
  },
  {
    id: "code",
    name: "Code Block",
    kind: "Primitive",
    summary: "Shared code surface with highlighting and copy actions.",
    href: "/primitives/code-block",
  },
  {
    id: "checkbox",
    name: "Checkbox",
    kind: "Primitive",
    summary: "Single checkbox control with checked and indeterminate states.",
    href: "/primitives/checkbox",
  },
  {
    id: "table-of-contents",
    name: "Table of contents",
    kind: "Primitive",
    summary: "Sticky in-page navigation with scroll-spy range highlighting.",
    href: "/primitives/table-of-contents",
  },
  {
    id: "cuicui",
    name: "Cuicui",
    kind: "Skin",
    summary: "Cuicui-inspired shell skin with a ChatComposer extension.",
    href: "/skins/cuicui",
  },
  {
    id: "chat-message",
    name: "ChatMessage",
    kind: "Agent",
    summary: "Composable chat message with typed role and tone state.",
    href: "/ai/chat-message",
  },
  {
    id: "chat",
    name: "Chat",
    kind: "Block",
    summary: "Complete chat recipe with messages, attachments, and a composer.",
    href: "/blocks/chat",
  },
] satisfies SearchItem[];

function resultIds(query: string) {
  return matchSearchItems(items, query).map((item) => item.id);
}

describe("matchSearchItems", () => {
  test("keeps direct name matches ahead of summary-only command matches", () => {
    expect(resultIds("command").slice(0, 2)).toEqual(["command", "agent-surface"]);
  });

  test("sorts exact leading letters before looser matches", () => {
    expect(resultIds("co").slice(0, 3)).toEqual(["command", "combobox", "code"]);
  });

  test("matches ordered first letters for acronyms", () => {
    expect(resultIds("toc")[0]).toBe("table-of-contents");
    expect(resultIds("cb")[0]).toBe("code");
  });

  test("keeps fuzzy in-order matches behind prefix matches", () => {
    const ids = resultIds("cmd");
    expect(ids[0]).toBe("command");
    expect(ids.indexOf("command")).toBeLessThan(ids.indexOf("agent-surface"));
  });

  test("keeps leading matches globally ordered without category or length bias", () => {
    const ids = resultIds("chat");
    expect(ids[0]).toBe("chat-message");
    expect(ids.indexOf("chat-message")).toBeLessThan(ids.indexOf("cuicui"));
    expect(ids.indexOf("chat-message")).toBeLessThan(ids.indexOf("chat"));
  });
});
