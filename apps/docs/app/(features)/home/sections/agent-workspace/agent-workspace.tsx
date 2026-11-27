import "./agent-workspace.css";
import { SectionLead, SectionTitle } from "@/app/(features)/home/shared/section-header";
import { InstallLadder } from "./install-ladder";
import { LevelHighlightScope } from "./level-highlight";
import { WorkspaceStage } from "./workspace-stage";

export function AgentWorkspace() {
  return (
    <section id="agent-workspace" aria-labelledby="agent-workspace-title" className="grid min-w-0 scroll-mt-20 gap-11">
      <LevelHighlightScope className="home-agent-workspace -mx-5 grid min-w-0 gap-10 bg-[oklch(from_var(--background)_calc(l-0.035)_c_h)] px-5 py-16 outline -outline-offset-1 outline-border/60 @4xl/home:mx-0 @4xl/home:gap-14 @4xl/home:rounded-[calc(var(--radius)*2.8)] @4xl/home:px-16 @4xl/home:py-20">
        <header className="flex min-w-0 flex-col gap-6 @6xl/home:flex-row @6xl/home:items-end @6xl/home:justify-between @6xl/home:gap-12">
          <div className="min-w-0 @6xl/home:flex-1">
            <div className="@6xl/home:@container @6xl/home:w-[72%]">
              <div className="@6xl/home:w-[138.8%]">
                <SectionTitle id="agent-workspace-title" lines={["One command for the screen."]} mutedLine="One for any part of it." />
              </div>
            </div>
          </div>
          <SectionLead link={{ href: "/kits", label: "Browse kits and templates" }}>
            The Coding agent template is the shell. Tool approval, the task list and the context meter are kits you add to it. None of them
            call a model: props in, callbacks out.
          </SectionLead>
        </header>
        <WorkspaceStage />
        <InstallLadder />
      </LevelHighlightScope>
    </section>
  );
}
