"use client";

import type { FormEvent } from "react";
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
import { Avatar, AvatarFallback } from "@/components/control-ui/ui/avatar";
import { Button } from "@/components/control-ui/ui/button";
import { Field, FieldControl, FieldError, FieldLabel } from "@/components/control-ui/ui/field";
import { InfiniteCanvas, InfiniteCanvasContent, InfiniteCanvasControls } from "@/components/control-ui/ui/infinite-canvas";
import { Input } from "@/components/control-ui/ui/input";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/control-ui/ui/popover";

type Agent = {
  id: string;
  name: string;
  role: string;
};

type TeamZone = {
  id: string;
  name: string;
  position: { x: number; y: number };
  agents: Agent[];
};

type AgentForm = {
  name: string;
  role: string;
  nameError: string | null;
  roleError: string | null;
};

const INITIAL_ZONES: TeamZone[] = [
  {
    id: "research",
    name: "Research",
    position: { x: 0, y: 0 },
    agents: [
      { id: "maya", name: "Maya Chen", role: "Research lead" },
      { id: "signals", name: "Signal Scout", role: "Evidence synthesis" },
    ],
  },
  {
    id: "product",
    name: "Product",
    position: { x: 240, y: 205 },
    agents: [
      { id: "noah", name: "Noah Williams", role: "Product strategist" },
      { id: "spec", name: "Spec Writer", role: "Requirements" },
    ],
  },
  {
    id: "delivery",
    name: "Delivery",
    position: { x: 40, y: 330 },
    agents: [{ id: "release", name: "Release Captain", role: "Deployment" }],
  },
];

const INITIAL_AGENT_FORM: AgentForm = {
  name: "",
  role: "",
  nameError: null,
  roleError: null,
};

function avatarInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function nextTeamPosition(index: number) {
  const column = index % 3;
  const row = Math.floor(index / 3);
  return { x: column * 260, y: row * 260 };
}

export function PrimitiveAgentTeamViewExample() {
  const [zones, setZones] = useState<TeamZone[]>(INITIAL_ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState(INITIAL_ZONES[0]?.id ?? "");
  const [teamName, setTeamName] = useState("");
  const [teamError, setTeamError] = useState<string | null>(null);
  const [agentForm, setAgentForm] = useState<AgentForm>(INITIAL_AGENT_FORM);
  const selectedZone = zones.find((zone) => zone.id === selectedZoneId);

  function createTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = teamName.trim();
    if (name.length === 0) {
      setTeamError("Enter a team name.");
      return;
    }
    const id = crypto.randomUUID();
    setZones((current) => [...current, { id, name, position: nextTeamPosition(current.length), agents: [] }]);
    setSelectedZoneId(id);
    setTeamName("");
    setTeamError(null);
  }

  function createAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = agentForm.name.trim();
    const role = agentForm.role.trim();
    const nameError = name.length === 0 ? "Enter an agent name." : null;
    const roleError = role.length === 0 ? "Enter an agent role." : null;
    if (!selectedZoneId || nameError || roleError) {
      setAgentForm((current) => ({ ...current, nameError, roleError }));
      return;
    }
    const agent: Agent = { id: crypto.randomUUID(), name, role };
    setZones((current) => current.map((zone) => (zone.id === selectedZoneId ? { ...zone, agents: [...zone.agents, agent] } : zone)));
    setAgentForm(INITIAL_AGENT_FORM);
  }

  return (
    <div className="w-full p-4 sm:p-6">
      <InfiniteCanvas className="h-150 w-full sm:h-165" defaultTransform={{ x: 20, y: 110, scale: 1 }}>
        <div className="absolute top-3 left-3 z-50 flex items-center gap-2 rounded-[var(--radius-panel)] bg-card/95 p-1.5 shadow-sm ring-1 ring-border backdrop-blur-sm">
          <Popover>
            <PopoverTrigger render={<Button size="sm" variant="surface" />}>New team</PopoverTrigger>
            <PopoverContent align="start">
              <PopoverHeader>
                <PopoverTitle>Create team</PopoverTitle>
              </PopoverHeader>
              <form className="grid gap-3 p-3 pt-0" onSubmit={createTeam}>
                <Field invalid={teamError !== null}>
                  <FieldLabel>Team name</FieldLabel>
                  <FieldControl
                    render={
                      <Input
                        autoFocus
                        required
                        value={teamName}
                        onChange={(event) => {
                          setTeamName(event.target.value);
                          setTeamError(null);
                        }}
                      />
                    }
                  />
                  <FieldError>{teamError}</FieldError>
                </Field>
                <Button type="submit" size="sm" variant="solid" tone="primary">
                  Create team
                </Button>
              </form>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger render={<Button size="sm" variant="solid" tone="primary" disabled={!selectedZone} />}>Add agent</PopoverTrigger>
            <PopoverContent align="start">
              <PopoverHeader>
                <PopoverTitle>Add to {selectedZone?.name ?? "team"}</PopoverTitle>
              </PopoverHeader>
              <form className="grid gap-3 p-3 pt-0" onSubmit={createAgent}>
                <Field invalid={agentForm.nameError !== null}>
                  <FieldLabel>Agent name</FieldLabel>
                  <FieldControl
                    render={
                      <Input
                        autoFocus
                        required
                        value={agentForm.name}
                        onChange={(event) => setAgentForm((current) => ({ ...current, name: event.target.value, nameError: null }))}
                      />
                    }
                  />
                  <FieldError>{agentForm.nameError}</FieldError>
                </Field>
                <Field invalid={agentForm.roleError !== null}>
                  <FieldLabel>Role</FieldLabel>
                  <FieldControl
                    render={
                      <Input
                        required
                        value={agentForm.role}
                        onChange={(event) => setAgentForm((current) => ({ ...current, role: event.target.value, roleError: null }))}
                      />
                    }
                  />
                  <FieldError>{agentForm.roleError}</FieldError>
                </Field>
                <Button type="submit" size="sm" variant="solid" tone="primary">
                  Add agent
                </Button>
              </form>
            </PopoverContent>
          </Popover>
          <span className="hidden px-1 text-meta text-muted-foreground sm:inline">Drag blocks · Two-finger pan</span>
        </div>
        <InfiniteCanvasContent>
          <AgentTeamView>
            {zones.map((zone) => (
              <AgentTeamViewZone
                key={zone.id}
                label={zone.name}
                position={zone.position}
                selected={zone.id === selectedZoneId}
                onSelect={() => setSelectedZoneId(zone.id)}
                onPositionChange={(position) =>
                  setZones((current) =>
                    current.map((currentZone) => (currentZone.id === zone.id ? { ...currentZone, position } : currentZone)),
                  )
                }
              >
                <AgentTeamViewZoneDragHandle>
                  <AgentTeamViewZoneTitle>{zone.name}</AgentTeamViewZoneTitle>
                  <span className="text-[11px] opacity-70">
                    {zone.agents.length} {zone.agents.length === 1 ? "agent" : "agents"}
                  </span>
                </AgentTeamViewZoneDragHandle>
                <AgentTeamViewZoneDetails>
                  <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                    <h3 className="text-sm font-medium">Agents</h3>
                    <span className="text-meta text-muted-foreground">{zone.agents.length}</span>
                  </div>
                  <AgentTeamViewZoneContent>
                    {zone.agents.length > 0 ? (
                      zone.agents.map((agent) => (
                        <AgentTeamViewAgent key={agent.id} aria-label={`${agent.name} — ${agent.role}`}>
                          <Avatar>
                            <AvatarFallback>{avatarInitials(agent.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{agent.name}</p>
                            <p className="truncate text-meta text-muted-foreground">{agent.role}</p>
                          </div>
                        </AgentTeamViewAgent>
                      ))
                    ) : (
                      <p className="px-2 py-5 text-center text-meta text-muted-foreground">Add an agent from the canvas toolbar.</p>
                    )}
                  </AgentTeamViewZoneContent>
                </AgentTeamViewZoneDetails>
              </AgentTeamViewZone>
            ))}
          </AgentTeamView>
        </InfiniteCanvasContent>
        <InfiniteCanvasControls />
      </InfiniteCanvas>
    </div>
  );
}
