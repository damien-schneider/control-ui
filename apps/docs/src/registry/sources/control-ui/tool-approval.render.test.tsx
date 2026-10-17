import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import type { ToolApprovalRiskLevel, ToolApprovalState } from "./tool-approval";
import {
  ToolApproval,
  ToolApprovalApprove,
  ToolApprovalBody,
  ToolApprovalDeny,
  ToolApprovalDescription,
  ToolApprovalField,
  ToolApprovalFooter,
  ToolApprovalHeader,
  ToolApprovalIcon,
  ToolApprovalPreview,
  ToolApprovalRisk,
  ToolApprovalStatus,
  ToolApprovalTitle,
} from "./tool-approval";

function renderApproval(state: ToolApprovalState, risk: ToolApprovalRiskLevel = "high") {
  return renderToString(
    <ToolApproval state={state} risk={risk}>
      <ToolApprovalBody>
        <ToolApprovalHeader>
          <ToolApprovalIcon />
          <ToolApprovalTitle>Delete the staging database</ToolApprovalTitle>
          <ToolApprovalRisk />
          <ToolApprovalStatus />
        </ToolApprovalHeader>
        <ToolApprovalDescription>The agent wants to drop every table.</ToolApprovalDescription>
        <ToolApprovalPreview>
          <ToolApprovalField label="Database">staging</ToolApprovalField>
        </ToolApprovalPreview>
      </ToolApprovalBody>
      <ToolApprovalFooter>
        <ToolApprovalDeny />
        <ToolApprovalApprove />
      </ToolApprovalFooter>
    </ToolApproval>,
  );
}

describe("ToolApproval", () => {
  test("a pending card shows its risk and both keyboard shortcuts", () => {
    const html = renderApproval("pending");

    expect(html).toContain('data-state="pending"');
    expect(html).toContain('data-risk="high"');
    expect(html).toContain("High risk");
    expect(html).toContain('aria-keyshortcuts="Escape"');
    expect(html).toContain('aria-keyshortcuts="Meta+Enter Control+Enter"');
  });

  test("an approved card collapses to its decision row", () => {
    const html = renderApproval("approved");

    expect(html).toContain("Approved");
    expect(html).not.toContain('data-slot="footer"');
    expect(html).not.toContain('data-slot="preview"');
    expect(html).not.toContain("High risk");
  });

  test("a denied card reports the denial", () => {
    expect(renderApproval("denied")).toContain("Denied");
  });

  test("the section is labelled by its title", () => {
    const html = renderApproval("pending");
    const labelledBy = html.match(/<section[^>]*aria-labelledby="([^"]+)"/)?.[1];
    const titleId = html.match(/<div[^>]*id="([^"]+)"[^>]*data-slot="title"/)?.[1];

    expect(labelledBy).toBeDefined();
    expect(labelledBy).toBe(titleId);
  });
});
