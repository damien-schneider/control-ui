import { mcpEndpointPath, mcpToolCards } from "@/app/(features)/agent-discovery/mcp-server";
import { IntentLink } from "@/app/(features)/client/intent-link";
import { countWord } from "@/app/(features)/home/home-content";
import { SectionLead, SectionTitle } from "@/app/(features)/home/shared/section-header";
import { Code, CodeActions, CodeContent, CodeCopy, CodeHeader, CodeTitle } from "@/components/control-ui/ui/code";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/control-ui/ui/table";
import { Text, TextLink } from "@/components/control-ui/ui/typography";
import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";
import { AgentSession } from "./agent-session";
import { agentSessionScript } from "./session-data";

const mcpConnectCommand = `claude mcp add --transport http \\\n  ${siteConfig.registry.name} ${absoluteSiteUrl(mcpEndpointPath)}`;

type SurfaceLink = { label: string; href: string; file?: boolean };

type Surface = { id: string; links: SurfaceLink[]; wideOnly?: string; returns: string };

const surfaces: Surface[] = [
  {
    id: "mcp",
    links: [{ label: mcpEndpointPath, href: "/agent-surface#mcp" }],
    returns: `MCP, ${countWord(mcpToolCards.length)} tools, no auth`,
  },
  {
    id: "llms",
    links: [
      { label: "/llms.txt", href: "/llms.txt", file: true },
      { label: "/llms-full.txt", href: "/llms-full.txt", file: true },
    ],
    returns: "index and full reference",
  },
  {
    id: "agent-index",
    links: [{ label: "/r/agent-index.json", href: "/r/agent-index.json", file: true }],
    returns: "static agent metadata",
  },
  {
    id: "markdown",
    links: [{ label: "Accept: text/markdown", href: "/agent-surface#markdown" }],
    returns: "any docs page, same URL",
  },
  {
    id: "skill",
    links: [{ label: ".claude/skills/control-ui", href: "/agent-skill" }],
    wideOnly: "installed, ",
    returns: "refreshed by updates",
  },
];

function SurfaceLinkItem({ link }: { link: SurfaceLink }) {
  return (
    <TextLink
      href={link.href}
      render={link.file ? undefined : <IntentLink href={link.href} />}
      className="inline-flex min-h-10 items-center"
    >
      <Text as="code" size="label" mono className="wrap-anywhere">
        {link.label}
      </Text>
    </TextLink>
  );
}

function SurfaceTable() {
  return (
    <Table>
      <TableCaption className="sr-only">Agent surfaces and what each one returns</TableCaption>
      <TableHeader className="sr-only">
        <TableRow>
          <TableHead scope="col">Surface</TableHead>
          <TableHead scope="col">What it returns</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {surfaces.map((surface) => (
          <TableRow key={surface.id}>
            <TableCell className="whitespace-normal">
              <span className="flex flex-wrap gap-x-3">
                {surface.links.map((link) => (
                  <SurfaceLinkItem key={link.href} link={link} />
                ))}
              </span>
            </TableCell>
            <TableCell className="whitespace-normal text-right">
              <Text size="label" tone="muted">
                {surface.wideOnly ? <span className="hidden @md/home:inline">{surface.wideOnly}</span> : null}
                {surface.returns}
              </Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function Agents() {
  return (
    <section
      id="agents"
      aria-labelledby="agents-title"
      className="grid min-w-0 gap-y-9 @4xl/home:gap-y-14 @5xl/home:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] @5xl/home:items-start @5xl/home:gap-x-12 @6xl/home:grid-cols-[28.75rem_minmax(0,1fr)] @6xl/home:grid-rows-[auto_1fr] @6xl/home:gap-x-16 @6xl/home:gap-y-9"
    >
      <header className="flex min-w-0 flex-col gap-5 @4xl/home:flex-row @4xl/home:items-end @4xl/home:justify-between @4xl/home:gap-12 @5xl/home:col-span-2 @6xl/home:@container @6xl/home:col-span-1 @6xl/home:flex-col @6xl/home:items-stretch @6xl/home:justify-start @6xl/home:gap-5">
        <SectionTitle id="agents-title" lines={["The manual ships"]} mutedLine="in the install." />
        <SectionLead className="@6xl/home:w-auto @6xl/home:pb-0">
          Every item installs with a doc that matches its source, and the set brings a skill that tells your agent how to work in it. The
          registry speaks MCP. Every docs page answers in markdown.
        </SectionLead>
      </header>
      <div className="grid min-w-0 gap-7 @4xl/home:grid-cols-2 @4xl/home:items-start @4xl/home:gap-x-8 @5xl/home:grid-cols-1 @6xl/home:gap-9">
        <Code overflow="wrap">
          <CodeHeader>
            <CodeTitle>Claude Code</CodeTitle>
            <CodeActions>
              <CodeCopy value={mcpConnectCommand} />
            </CodeActions>
          </CodeHeader>
          <CodeContent code={mcpConnectCommand} lang="bash" highlight="none" />
        </Code>
        <SurfaceTable />
      </div>
      <div className="mt-2 min-w-0 @4xl/home:mt-0 @6xl/home:col-start-2 @6xl/home:row-span-2 @6xl/home:row-start-1">
        <AgentSession script={agentSessionScript()} />
      </div>
    </section>
  );
}
