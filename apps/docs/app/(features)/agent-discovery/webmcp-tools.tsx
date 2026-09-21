"use client";

import { useEffect } from "react";

type ToolTextResult = { content: { type: "text"; text: string }[] };

type ToolInputSchema = {
  type: "object";
  properties: Record<string, { type: "string"; description: string }>;
  required: string[];
};

type ModelContextTool = {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
  execute: (input: unknown) => Promise<ToolTextResult>;
};

type UnregisterTools = () => void;

type ModelContext = {
  registerTool?: (tool: ModelContextTool, options?: { signal?: AbortSignal }) => UnregisterTools | Promise<unknown> | undefined;
  provideContext?: (context: { tools: ModelContextTool[] }) => void;
};

declare global {
  interface Navigator {
    modelContext?: ModelContext;
  }
  interface Document {
    modelContext?: ModelContext;
  }
}

function fieldsOf(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null) return {};
  return Object.fromEntries(Object.entries(value));
}

function stringAt(fields: Record<string, unknown>, key: string): string {
  const value = fields[key];
  return typeof value === "string" ? value : "";
}

function listAt(fields: Record<string, unknown>, key: string): unknown[] {
  const value = fields[key];
  return Array.isArray(value) ? value : [];
}

function textResult(payload: Record<string, unknown>): ToolTextResult {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

async function fetchJson(path: string): Promise<{ ok: boolean; status: number; fields: Record<string, unknown> }> {
  const response = await fetch(path, { headers: { accept: "application/json" } });
  const body = await response.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = undefined;
  }
  return { ok: response.ok, status: response.status, fields: fieldsOf(parsed) };
}

const searchControlUi: ModelContextTool = {
  name: "search_control_ui",
  description:
    "Search the Control UI registry and documentation for components, blocks, primitives, hooks, utilities, extensions, skins, and guides. Returns each match with its registry id, name, kind, summary, and documentation URL.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: 'What to look for, such as "chat message", "streaming", "keyboard shortcuts", or "skin".',
      },
    },
    required: ["query"],
  },
  execute: async (input) => {
    const query = stringAt(fieldsOf(input), "query").trim();
    if (query.length === 0) return textResult({ error: "query must be a non-empty string" });
    const body = await fetchJson(`/api/registry/search?q=${encodeURIComponent(query)}`);
    if (!body.ok) return textResult({ error: `Registry search failed with HTTP ${body.status}`, query });
    const matches = listAt(body.fields, "data").map((entry) => {
      const item = fieldsOf(entry);
      return {
        id: stringAt(item, "id"),
        name: stringAt(item, "name"),
        kind: stringAt(item, "kind"),
        summary: stringAt(item, "summary"),
        docsUrl: new URL(stringAt(item, "href"), window.location.origin).toString(),
      };
    });
    return textResult({ query, matchCount: matches.length, matches });
  },
};

const getControlUiItem: ModelContextTool = {
  name: "get_control_ui_item",
  description:
    "Read one Control UI registry item by id: its shadcn install command, npm and registry dependencies, and the source file paths the install writes. Use search_control_ui to find the id.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: 'Registry item id returned by search_control_ui, such as "chat-message" or "use-chat-message".',
      },
    },
    required: ["id"],
  },
  execute: async (input) => {
    const id = stringAt(fieldsOf(input), "id").trim();
    if (id.length === 0) return textResult({ error: "id must be a non-empty string" });
    const body = await fetchJson(`/api/registry/${encodeURIComponent(id)}`);
    if (!body.ok) {
      return textResult({
        error: stringAt(body.fields, "error") || `Registry lookup failed with HTTP ${body.status}`,
        id,
        suggestions: listAt(body.fields, "suggestions").map((entry) => stringAt(fieldsOf(entry), "id")),
      });
    }
    const item = fieldsOf(body.fields.data);
    const deps = fieldsOf(item.deps);
    return textResult({
      id: stringAt(item, "id"),
      name: stringAt(item, "name"),
      kind: stringAt(item, "kind"),
      summary: stringAt(item, "summary"),
      docsUrl: new URL(stringAt(item, "href"), window.location.origin).toString(),
      install: listAt(item, "install").map((entry) => stringAt(fieldsOf(entry), "value")),
      dependencies: {
        npm: listAt(deps, "dependencies").filter((entry): entry is string => typeof entry === "string"),
        registry: listAt(deps, "registryDependencies").filter((entry): entry is string => typeof entry === "string"),
      },
      files: listAt(item, "files").map((entry) => stringAt(fieldsOf(entry), "path")),
    });
  },
};

function sameOriginDocsUrl(href: string): string | undefined {
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function navigateResult(input: unknown): ToolTextResult {
  const href = stringAt(fieldsOf(input), "href").trim();
  if (href.length === 0) return textResult({ error: "href must be a non-empty string" });
  const target = sameOriginDocsUrl(href);
  if (!target) return textResult({ error: `href must resolve to a path on ${window.location.origin}`, href });
  window.location.assign(target);
  return textResult({ navigatedTo: target });
}

const navigateDocs: ModelContextTool = {
  name: "navigate_docs",
  description:
    "Open a Control UI documentation route in the current tab, such as /components/chat-message. Only same-origin paths on this site are accepted.",
  inputSchema: {
    type: "object",
    properties: {
      href: {
        type: "string",
        description: 'Documentation path on this site, such as "/components/chat-message" or "/guides/architecture".',
      },
    },
    required: ["href"],
  },
  execute: (input) => Promise.resolve(navigateResult(input)),
};

const docsTools: ModelContextTool[] = [searchControlUi, getControlUiItem, navigateDocs];

function modelContexts(): ModelContext[] {
  const contexts: ModelContext[] = [];
  if (navigator.modelContext) contexts.push(navigator.modelContext);
  if (document.modelContext && document.modelContext !== navigator.modelContext) contexts.push(document.modelContext);
  return contexts;
}

function registerWebMcpTools(context: ModelContext, signal: AbortSignal): UnregisterTools | undefined {
  const { registerTool, provideContext } = context;
  if (registerTool) {
    const disposers: UnregisterTools[] = [];
    for (const tool of docsTools) {
      const registration = registerTool.call(context, tool, { signal });
      if (typeof registration === "function") disposers.push(registration);
      else registration?.catch(() => undefined);
    }
    if (disposers.length === 0) return undefined;
    return () => {
      for (const dispose of disposers) dispose();
    };
  }
  if (!provideContext) return undefined;
  provideContext.call(context, { tools: docsTools });
  return () => provideContext.call(context, { tools: [] });
}

export function WebMcpTools() {
  useEffect(() => {
    const controller = new AbortController();
    const disposers = modelContexts()
      .map((context) => registerWebMcpTools(context, controller.signal))
      .filter((dispose): dispose is UnregisterTools => dispose !== undefined);

    return () => {
      controller.abort();
      for (const dispose of disposers) dispose();
    };
  }, []);

  return null;
}
