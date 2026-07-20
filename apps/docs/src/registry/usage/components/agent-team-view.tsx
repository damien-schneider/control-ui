"use client";

import { useState } from "react";
import {
  AgentTeamView,
  AgentTeamViewAgent,
  AgentTeamViewZone,
  AgentTeamViewZoneContent,
  AgentTeamViewZoneDetails,
  AgentTeamViewZoneDragHandle,
  AgentTeamViewZoneTitle,
} from "@/components/control-ui/agent-team-view";
import { InfiniteCanvas, InfiniteCanvasContent, InfiniteCanvasControls } from "@/components/control-ui/ui/infinite-canvas";

export function Example() {
  const [position, setPosition] = useState({ x: 120, y: 96 });

  return (
    <InfiniteCanvas className="h-120 w-full" defaultTransform={{ x: 0, y: 0, scale: 1 }}>
      <InfiniteCanvasContent>
        <AgentTeamView>
          <AgentTeamViewZone label="Research" position={position} selected onPositionChange={setPosition}>
            <AgentTeamViewZoneDragHandle>
              <AgentTeamViewZoneTitle>Research</AgentTeamViewZoneTitle>
            </AgentTeamViewZoneDragHandle>
            <AgentTeamViewZoneDetails>
              <AgentTeamViewZoneContent>
                <AgentTeamViewAgent>Signal Scout</AgentTeamViewAgent>
              </AgentTeamViewZoneContent>
            </AgentTeamViewZoneDetails>
          </AgentTeamViewZone>
        </AgentTeamView>
      </InfiniteCanvasContent>
      <InfiniteCanvasControls />
    </InfiniteCanvas>
  );
}
