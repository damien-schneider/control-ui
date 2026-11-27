import { mcpToolCards } from "@/app/(features)/agent-discovery/mcp-server";
import { getRegistryItem, isRegistryError } from "@/app/(features)/registry-api/api";

const sessionItemId = "tool-approval";

export type SessionSurface = "MCP" | "CLI" | "FILE" | "HTTP";

export type SessionStep = { title: string; surface: SessionSurface; call: string[]; result: string };

export type AgentSessionScript = { prompt: string; steps: SessionStep[]; outcome: string };

function counted(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function mcpToolName(name: string) {
  const tool = mcpToolCards.find((card) => card.name === name);
  if (!tool) throw new Error(`The MCP server has no "${name}" tool`);
  return tool.name;
}

export function agentSessionScript(): AgentSessionScript {
  const item = getRegistryItem(sessionItemId);
  if (isRegistryError(item)) throw new Error(item.error);

  const { id, kind, summary, install, deps, files, anatomy } = item.data;
  const installCommand = install[0]?.value;
  const knobs = anatomy?.knobs[id];
  if (!(installCommand && deps && knobs)) throw new Error(`The "${id}" registry item no longer carries what the example session quotes`);

  const kindLabel = kind.toLowerCase();
  const installTargetStart = installCommand.lastIndexOf(" ");
  const dependencies = [
    counted(deps.dependencies.length, "npm package"),
    counted(deps.registryDependencies.length, "registry dependency", "registry dependencies"),
  ].join(", ");

  return {
    prompt: "Ask before the agent pushes to origin.",
    steps: [
      {
        title: "Search the registry",
        surface: "MCP",
        call: [`${mcpToolName("search_registry")}({ query: "approval" })`],
        result: `${id} · ${kindLabel} · ${summary}`,
      },
      {
        title: "Inspect the item",
        surface: "MCP",
        call: [`${mcpToolName("get_registry_item")}({ id: "${id}" })`],
        result: `Install command, ${dependencies}, ${counted(files.length, "source file")} and the anatomy, in one { type, data } envelope.`,
      },
      {
        title: "Install it",
        surface: "CLI",
        call: [installCommand.slice(0, installTargetStart), installCommand.slice(installTargetStart + 1)],
        result: `Writes ${id}.tsx, its recipe CSS, its knob contract and docs/${id}.md.`,
      },
      {
        title: "Read the installed doc",
        surface: "FILE",
        call: [`components/control-ui/docs/${id}.md`],
        result: `“This file matches the installed ${id} source.” The online docs may already describe a newer version.`,
      },
      {
        title: "Restyle through the contract",
        surface: "HTTP",
        call: [`GET /r/contract/${id}.json`],
        result: `${counted(knobs.length, "knob")} it may re-value. It writes one rule in skin.css and no component file.`,
      },
    ],
    outcome: `1 ${kindLabel} added · 1 rule in skin.css · 0 component files edited`,
  };
}
