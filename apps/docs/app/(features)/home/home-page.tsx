import "./home.css";
import { AgentWorkspace } from "./sections/agent-workspace/agent-workspace";
import { Agents } from "./sections/agents/agents";
import { CatalogAtlas } from "./sections/catalog-atlas/catalog-atlas";
import { Hero } from "./sections/hero/hero";
import { SkinStudio } from "./sections/skin-studio/skin-studio";
import { Start } from "./sections/start/start";
import { UpdateContract } from "./sections/update-contract/update-contract";

export function HomePage() {
  return (
    <div className="@container/home min-w-0 overflow-x-clip">
      <div className="mx-auto flex w-full max-w-318 min-w-0 flex-col gap-32 px-5 pt-12 pb-28 @3xl/home:gap-52 @3xl/home:px-15 @3xl/home:pt-20 @3xl/home:pb-44">
        <Hero />
        <CatalogAtlas />
        <SkinStudio />
        <AgentWorkspace />
        <UpdateContract />
        <Agents />
        <Start />
      </div>
    </div>
  );
}
