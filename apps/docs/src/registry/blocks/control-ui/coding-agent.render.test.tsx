import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { CodingAgentBlock, CodingAgentConversation, CodingAgentEmptyState } from "./coding-agent";

describe("CodingAgentBlock", () => {
  test("renders the active project task and the controlled conversation seam", () => {
    const html = renderToString(
      <CodingAgentBlock
        layout="contained"
        appName="Workbench"
        activeTaskId="build-workspace"
        activeTaskTitle="Build a coding workspace"
        projects={[
          {
            id: "control-ui",
            name: "control-ui",
            tasks: [
              { id: "build-workspace", title: "Build a coding workspace" },
              { id: "review-diff", title: "Review the latest diff" },
            ],
          },
        ]}
      >
        <CodingAgentConversation composer={<div>Composer</div>}>
          <div>Conversation</div>
        </CodingAgentConversation>
      </CodingAgentBlock>,
    );

    expect(html).toContain("Workbench");
    expect(html).toContain("Build a coding workspace");
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('data-control-ui="chat-layout"');
    expect(html).toContain("Conversation");
    expect(html).toContain("Composer");
  });

  test("renders prompt suggestions as real buttons", () => {
    const html = renderToString(
      <CodingAgentEmptyState
        title="What should we build?"
        suggestions={[{ id: "explore", title: "Explore the codebase", prompt: "Map the codebase" }]}
      />,
    );

    expect(html).toContain("What should we build?");
    expect(html).toContain("Explore the codebase");
    expect(html).toContain("<button");
  });
});
