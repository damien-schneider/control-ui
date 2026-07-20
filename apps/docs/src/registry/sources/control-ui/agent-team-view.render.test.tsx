import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import {
  AgentTeamView,
  AgentTeamViewAgent,
  AgentTeamViewZone,
  AgentTeamViewZoneContent,
  AgentTeamViewZoneDetails,
  AgentTeamViewZoneDragHandle,
  AgentTeamViewZoneTitle,
} from "./agent-team-view";
import { InfiniteCanvas, InfiniteCanvasContent } from "./ui/infinite-canvas";

describe("AgentTeamView", () => {
  test("renders a selected 3D team block with adjacent agent details", () => {
    const html = renderToString(
      <InfiniteCanvas transform={{ x: 0, y: 0, scale: 1 }}>
        <InfiniteCanvasContent>
          <AgentTeamView>
            <AgentTeamViewZone label="Research" position={{ x: 96, y: 88 }} selected onSelect={() => {}}>
              <AgentTeamViewZoneDragHandle>
                <AgentTeamViewZoneTitle>Research</AgentTeamViewZoneTitle>
              </AgentTeamViewZoneDragHandle>
              <AgentTeamViewZoneDetails>
                <AgentTeamViewZoneContent>
                  <AgentTeamViewAgent>Maya Chen</AgentTeamViewAgent>
                </AgentTeamViewZoneContent>
              </AgentTeamViewZoneDetails>
            </AgentTeamViewZone>
          </AgentTeamView>
        </InfiniteCanvasContent>
      </InfiniteCanvas>,
    );

    expect(html).toContain('data-control-ui="agent-team-view"');
    expect(html).toContain('data-slot="zone-top"');
    expect(html).toContain('data-slot="zone-front"');
    expect(html).toContain('data-slot="zone-side"');
    expect(html).toContain('data-slot="zone-details"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("--agent-team-zone-x:96px");
    expect(html).toContain("Maya Chen");
  });

  test("keeps details hidden until a team is selected", () => {
    const html = renderToString(
      <InfiniteCanvas>
        <InfiniteCanvasContent>
          <AgentTeamView>
            <AgentTeamViewZone label="Delivery" position={{ x: 0, y: 0 }}>
              <AgentTeamViewZoneDragHandle>
                <AgentTeamViewZoneTitle>Delivery</AgentTeamViewZoneTitle>
              </AgentTeamViewZoneDragHandle>
              <AgentTeamViewZoneDetails>Hidden details</AgentTeamViewZoneDetails>
            </AgentTeamViewZone>
          </AgentTeamView>
        </InfiniteCanvasContent>
      </InfiniteCanvas>,
    );

    expect(html).not.toContain("Hidden details");
    expect(html).toContain('aria-pressed="false"');
  });
});
