import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import {
  AgentTeamView,
  AgentTeamViewAgent,
  AgentTeamViewCanvas,
  AgentTeamViewZone,
  AgentTeamViewZoneContent,
  AgentTeamViewZoneDragHandle,
  AgentTeamViewZoneHeader,
  AgentTeamViewZoneTitle,
} from "./ui/agent-team-view";

describe("AgentTeamView", () => {
  test("renders complete non-modal workspace anatomy with accessible movement controls", () => {
    const html = renderToString(
      <AgentTeamView>
        <AgentTeamViewCanvas>
          <AgentTeamViewZone
            label="Research"
            position={{ x: 96, y: 88 }}
            selected
            disabled
            onPositionChange={() => {}}
          >
            <AgentTeamViewZoneHeader>
              <AgentTeamViewZoneDragHandle />
              <AgentTeamViewZoneTitle>Research</AgentTeamViewZoneTitle>
            </AgentTeamViewZoneHeader>
            <AgentTeamViewZoneContent>
              <AgentTeamViewAgent>Atlas — Research lead</AgentTeamViewAgent>
            </AgentTeamViewZoneContent>
          </AgentTeamViewZone>
        </AgentTeamViewCanvas>
      </AgentTeamView>,
    );

    for (const slot of [
      "root",
      "canvas",
      "zone",
      "zone-base",
      "zone-platform",
      "zone-header",
      "zone-drag-handle",
      "zone-title",
      "zone-content",
      "agent",
    ]) {
      expect(html).toContain(`data-slot="${slot}"`);
    }
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Agent team workspace"');
    expect(html).toContain('aria-label="Research team zone"');
    expect(html).toContain('aria-label="Move Research team. Use arrow keys for precise movement."');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('data-selected="true"');
    expect(html).toContain('data-disabled="true"');
    expect(html).toContain("width:1040px;height:640px");
    expect(html).toContain("--agent-team-zone-x:96px;--agent-team-zone-y:88px");
    expect(html).not.toContain('aria-modal="true"');
  });
});
