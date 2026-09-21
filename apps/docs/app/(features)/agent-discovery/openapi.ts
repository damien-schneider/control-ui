import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";

const searchItemKinds = ["Guide", "Skill", "Component", "Block", "Primitive", "Hook", "Util", "Extension", "Skin"];
const registryItemKinds = [...searchItemKinds, "Bundle"];
const statusValues = ["beta", "experimental"];

const searchItemProperties = {
  id: { type: "string", description: "Stable registry item id, also the docs page id.", examples: ["chat-message"] },
  name: { type: "string", examples: ["ChatMessage"] },
  kind: { type: "string", enum: searchItemKinds },
  summary: { type: "string" },
  href: { type: "string", description: "Documentation path on this site.", examples: ["/components/chat-message"] },
  status: { type: "string", enum: statusValues, description: "Maturity; absent means stable." },
  label: { type: "string", description: "Navigation label when the docs tree labels the page differently from its name." },
};

function jsonResponse(description: string, schemaName: string) {
  return { description, content: { "application/json": { schema: { $ref: `#/components/schemas/${schemaName}` } } } };
}

const componentSchemas = {
  SearchItem: {
    type: "object",
    required: ["id", "name", "kind", "summary", "href"],
    properties: searchItemProperties,
  },
  RegistryIndexItem: {
    type: "object",
    required: ["id", "name", "kind", "summary", "href"],
    properties: {
      ...searchItemProperties,
      install: {
        type: "string",
        description: "First install command for the item; absent for prose-only pages.",
        examples: [`npx shadcn@latest add ${absoluteSiteUrl("/r/chat-message.json")}`],
      },
    },
  },
  RegistryContractLinks: {
    type: "object",
    required: ["skin", "theme"],
    properties: {
      skin: { type: "string", format: "uri", description: "Complete skin contract manifest." },
      theme: { type: "string", format: "uri", description: "Complete theme contract manifest." },
    },
  },
  RegistryFullInstall: {
    type: "object",
    description: "One-command install of every component under a single skin.",
    required: ["id", "skin", "name", "summary", "manifestUrl", "install"],
    properties: {
      id: { type: "string", examples: ["all-refined"] },
      skin: { type: "string", examples: ["refined"] },
      name: { type: "string" },
      summary: { type: "string" },
      manifestUrl: { type: "string", format: "uri" },
      install: { type: "string" },
    },
  },
  InstallCommand: {
    type: "object",
    required: ["label", "value"],
    properties: {
      label: { type: "string", examples: ["Registry command"] },
      value: { type: "string" },
    },
  },
  SourceFile: {
    type: "object",
    required: ["label", "path", "code"],
    properties: {
      label: { type: "string", examples: ["Component"] },
      path: { type: "string", examples: ["src/registry/sources/control-ui/chat-message.tsx"] },
      code: { type: "string", description: "Full file contents." },
      slot: { type: "string" },
      shared: { type: "boolean", description: "True when more than one registry item installs the file." },
    },
  },
  ContractKnob: {
    type: "object",
    required: ["name", "syntax", "initialValue", "defaultValue"],
    properties: {
      name: { type: "string", examples: ["--cui-chat-message-avatar-radius"] },
      syntax: { type: "string" },
      initialValue: { type: "string" },
      defaultValue: { type: "string" },
    },
  },
  ContractState: {
    type: "object",
    required: ["attribute", "source", "valueKind", "values"],
    properties: {
      attribute: { type: "string" },
      source: { type: "string", enum: ["control-ui", "external"] },
      valueKind: { type: "string", enum: ["enum", "open", "presence"] },
      values: { type: "array", items: { type: "string" } },
    },
  },
  ContractPart: {
    type: "object",
    required: ["registryItems", "states"],
    properties: {
      context: { type: "object", additionalProperties: { type: "string" } },
      family: { type: "string" },
      registryItems: { type: "array", items: { type: "string" } },
      states: { type: "array", items: { $ref: "#/components/schemas/ContractState" } },
    },
  },
  ContractScope: {
    type: "object",
    required: ["parts", "registryItems"],
    properties: {
      parts: { type: "object", additionalProperties: { $ref: "#/components/schemas/ContractPart" } },
      registryItems: { type: "array", items: { type: "string" } },
    },
  },
  RegistryAnatomySlice: {
    type: "object",
    required: ["version", "contractUrl", "selectorPattern", "ownScopes", "installedScopes", "knobs"],
    properties: {
      version: { type: "integer", description: "Skin contract version this slice was generated from." },
      contractUrl: { type: "string", format: "uri" },
      selectorPattern: { type: "string", description: "Template for the CSS selector that targets a skinned part." },
      ownScopes: {
        type: "object",
        description: "Scopes whose parts this item owns.",
        additionalProperties: { $ref: "#/components/schemas/ContractScope" },
      },
      installedScopes: {
        type: "object",
        description: "Scopes covering the transitive install closure of this item.",
        additionalProperties: { $ref: "#/components/schemas/ContractScope" },
      },
      knobs: {
        type: "object",
        description: "Custom property families keyed by scope.",
        additionalProperties: { type: "array", items: { $ref: "#/components/schemas/ContractKnob" } },
      },
    },
  },
  RegistryItem: {
    type: "object",
    required: ["id", "name", "kind", "summary", "href", "install", "files"],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      kind: { type: "string", enum: registryItemKinds },
      summary: { type: "string" },
      href: { type: "string" },
      status: { type: "string", enum: statusValues, description: "Maturity; absent means stable." },
      install: { type: "array", items: { $ref: "#/components/schemas/InstallCommand" } },
      manifestUrl: { type: "string", format: "uri", description: "shadcn manifest; absent when the item has none." },
      deps: {
        type: "object",
        required: ["dependencies", "registryDependencies"],
        properties: {
          dependencies: { type: "array", items: { type: "string" } },
          registryDependencies: { type: "array", items: { type: "string" } },
        },
      },
      files: {
        type: "array",
        description: "Readable source files an agent would open; empty for prose-only pages and bundles.",
        items: { $ref: "#/components/schemas/SourceFile" },
      },
      anatomy: { $ref: "#/components/schemas/RegistryAnatomySlice" },
    },
  },
  RegistryIndexEnvelope: {
    type: "object",
    required: ["type", "data"],
    properties: {
      type: { type: "string", const: "index" },
      data: {
        type: "object",
        required: ["count", "contracts", "fullInstalls", "items"],
        properties: {
          count: { type: "integer" },
          contracts: { $ref: "#/components/schemas/RegistryContractLinks" },
          fullInstalls: { type: "array", items: { $ref: "#/components/schemas/RegistryFullInstall" } },
          items: { type: "array", items: { $ref: "#/components/schemas/RegistryIndexItem" } },
        },
      },
    },
  },
  RegistryItemEnvelope: {
    type: "object",
    required: ["type", "data"],
    properties: {
      type: { type: "string", const: "item" },
      data: { $ref: "#/components/schemas/RegistryItem" },
    },
  },
  RegistrySearchEnvelope: {
    type: "object",
    required: ["type", "data"],
    properties: {
      type: { type: "string", const: "search" },
      data: { type: "array", items: { $ref: "#/components/schemas/SearchItem" } },
    },
  },
  RegistryError: {
    type: "object",
    required: ["error", "code", "suggestions"],
    properties: {
      error: { type: "string", examples: ['No registry item named "chat-mesage"'] },
      code: { type: "string", const: "ERR_UNKNOWN_ITEM" },
      suggestions: {
        type: "array",
        description: "Up to three ids close to the requested one.",
        items: {
          type: "object",
          required: ["id", "reason"],
          properties: { id: { type: "string" }, reason: { type: "string", examples: ["similar name"] } },
        },
      },
    },
  },
};

const apiPaths = {
  "/api/registry": {
    get: {
      operationId: "listRegistry",
      summary: "List every registry item",
      description:
        "Aggregate catalog of components, blocks, primitives, hooks, utils, extensions, skins, skills, and guides, with the skin and theme contract links and the full-install bundles.",
      responses: { "200": jsonResponse("Registry index envelope.", "RegistryIndexEnvelope") },
    },
  },
  "/api/registry/{id}": {
    get: {
      operationId: "getRegistryItem",
      summary: "Read one registry item",
      description: "Item metadata with its install commands, npm and registry dependencies, readable source files, and skin anatomy slice.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Registry item id or full-install bundle id.",
          schema: { type: "string", examples: ["chat-message"] },
        },
      ],
      responses: {
        "200": jsonResponse("Registry item envelope.", "RegistryItemEnvelope"),
        "404": jsonResponse("No item with that id; the body suggests close matches.", "RegistryError"),
      },
    },
  },
  "/api/registry/search": {
    get: {
      operationId: "searchRegistry",
      summary: "Search the registry",
      description: "Same match surface as the in-app command palette. An empty or omitted query returns the full corpus.",
      parameters: [
        {
          name: "q",
          in: "query",
          required: false,
          description: "Free-text query matched against item id, name, kind, and summary.",
          schema: { type: "string", examples: ["chat"] },
        },
      ],
      responses: { "200": jsonResponse("Registry search envelope.", "RegistrySearchEnvelope") },
    },
  },
};

export const openApiDocument = {
  openapi: "3.1.1",
  info: {
    title: `${siteConfig.name} registry API`,
    version: "1.0.0",
    summary: "Read-only HTTP access to the Control UI registry: index, item detail with source, and search.",
    description:
      "The registry API serves the same catalog the human documentation reads, so the agent and human views cannot drift. Every response is a `{ type, data }` envelope except the 404 error body.",
    license: { name: "MIT", identifier: "MIT" },
  },
  externalDocs: { description: "Machine docs guide", url: absoluteSiteUrl("/agent-surface") },
  servers: [{ url: siteConfig.url.origin, description: `${siteConfig.name} documentation site` }],
  paths: apiPaths,
  components: { schemas: componentSchemas },
};
