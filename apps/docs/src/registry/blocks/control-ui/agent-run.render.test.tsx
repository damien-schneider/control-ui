import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import {
  ToolApproval,
  ToolApprovalApprove,
  ToolApprovalBody,
  ToolApprovalDeny,
  ToolApprovalFooter,
  ToolApprovalHeader,
  ToolApprovalTitle,
} from "../../sources/control-ui/tool-approval";
import { AgentRunBlock, AgentRunBody, AgentRunHeader, AgentRunPlan, AgentRunStep } from "./agent-run";

function renderRun() {
  return renderToString(
    <AgentRunBlock layout="contained" runs={[{ id: "report", title: "Weekly report", status: "waiting" }]} activeRunId="report">
      <AgentRunHeader title="Weekly report" status="waiting" startedAt={Date.now()} />
      <AgentRunBody>
        <AgentRunPlan>
          <AgentRunStep state="success" title="Collect data" startedAt={0} endedAt={8_000} />
          <AgentRunStep state="waiting" title="Post the summary">
            <ToolApproval>
              <ToolApprovalBody>
                <ToolApprovalHeader>
                  <ToolApprovalTitle>Post to #revenue</ToolApprovalTitle>
                </ToolApprovalHeader>
              </ToolApprovalBody>
              <ToolApprovalFooter>
                <ToolApprovalDeny />
                <ToolApprovalApprove />
              </ToolApprovalFooter>
            </ToolApproval>
          </AgentRunStep>
        </AgentRunPlan>
      </AgentRunBody>
    </AgentRunBlock>,
  );
}

describe("AgentRunBlock", () => {
  test("marks the step waiting on approval as the current step", () => {
    const html = renderRun();
    const waitingItem = html.match(/<li[^>]*data-state="waiting"[^>]*>/)?.[0];

    expect(waitingItem).toContain('aria-current="step"');
    expect(html).toContain("Needs approval");
    expect(html).toContain('aria-keyshortcuts="Meta+Enter Control+Enter"');
  });

  test("nests the run title under the host page heading when contained", () => {
    expect(renderRun()).toMatch(/<h2[^>]*>Weekly report<\/h2>/);
  });

  test("renders finished durations on the server and leaves the live timer empty", () => {
    const html = renderRun();
    const headerTime = html.match(/<header[\s\S]*?<time([^>]*)>([^<]*)<\/time>/);

    expect(html).toContain("0:08");
    expect(html).toContain('dateTime="PT8S"');
    expect(headerTime?.[2]).toBe("");
    expect(headerTime?.[1]).not.toContain("dateTime");
  });
});
