import { FileText, FolderGit2 } from "lucide-react";
import { createRoot } from "react-dom/client";
import { AppShell, AppShellContent } from "@/components/control-ui/ui/app-shell";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/control-ui/ui/sidebar";
import { Tree, TreeItem, TreeItemContent, TreeItemIndicator, TreeItemLabel, TreeItemTrigger } from "@/components/control-ui/ui/tree";
import { Text } from "@/components/control-ui/ui/typography";

const parameters = new URLSearchParams(location.search);
const scopeCount = Number(parameters.get("scopes") ?? 40);
const fileCount = Number(parameters.get("files") ?? 25);
const paragraphCount = Number(parameters.get("paragraphs") ?? 0);
const paragraphs = Array.from(
  { length: paragraphCount },
  (_paragraph, index) =>
    `Paragraph ${index}: a long line of prose that wraps across the document column, so changing the column width reflows every line of text below it.`,
);
const scopes = Array.from({ length: scopeCount }, (_scope, index) => ({
  id: `scope-${index}`,
  label: `project-${index}`,
  files: Array.from({ length: fileCount }, (_file, file) => ({ id: `scope-${index}/file-${file}`, label: `file-${file}.md` })),
}));

function Fixture() {
  return (
    <AppShell defaultOpen persistOpen={false}>
      <Sidebar variant="inset">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel id="projects">Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <Tree aria-labelledby="projects" defaultExpandedValue={scopes.map((scope) => scope.id)} selectionMode="single">
                {scopes.map((scope) => (
                  <TreeItem key={scope.id} label={scope.label} value={scope.id}>
                    <TreeItemTrigger>
                      <TreeItemIndicator />
                      <FolderGit2 aria-hidden="true" className="size-3.5 shrink-0" />
                      <TreeItemLabel>{scope.label}</TreeItemLabel>
                    </TreeItemTrigger>
                    <TreeItemContent>
                      {scope.files.map((file) => (
                        <TreeItem key={file.id} label={file.label} value={file.id}>
                          <TreeItemTrigger>
                            <TreeItemIndicator />
                            <FileText aria-hidden="true" className="size-3.5 shrink-0" />
                            <TreeItemLabel className="flex-initial">{file.label}</TreeItemLabel>
                            <Text as="span" className="min-w-0 flex-1 truncate" size="caption" tone="muted">
                              skill
                            </Text>
                          </TreeItemTrigger>
                        </TreeItem>
                      ))}
                    </TreeItemContent>
                  </TreeItem>
                ))}
              </Tree>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <AppShellContent>
        <ScrollArea className="h-full">
          <article className="flex flex-col gap-3 p-6">
            <p>Editor</p>
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        </ScrollArea>
      </AppShellContent>
    </AppShell>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Fixture root is missing");
createRoot(root).render(<Fixture />);
