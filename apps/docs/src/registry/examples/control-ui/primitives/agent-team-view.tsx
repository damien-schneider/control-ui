"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { AgentTeamViewPosition } from "@/components/control-ui/contracts";
import {
  AgentTeamView,
  AgentTeamViewAgent,
  AgentTeamViewCanvas,
  AgentTeamViewZone,
  AgentTeamViewZoneContent,
  AgentTeamViewZoneDragHandle,
  AgentTeamViewZoneHeader,
  AgentTeamViewZoneTitle,
} from "@/components/control-ui/ui/agent-team-view";
import { Avatar, AvatarFallback } from "@/components/control-ui/ui/avatar";
import { Button } from "@/components/control-ui/ui/button";
import { Field, FieldControl, FieldError, FieldLabel } from "@/components/control-ui/ui/field";
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
  position: AgentTeamViewPosition;
  agents: Agent[];
};

type TeamFormState = {
  open: boolean;
  name: string;
  error: string | null;
};

type AgentFormState = {
  open: boolean;
  name: string;
  role: string;
  nameError: string | null;
  roleError: string | null;
};

const INITIAL_ZONES: TeamZone[] = [
  {
    id: "research",
    name: "Research",
    position: { x: 96, y: 88 },
    agents: [
      { id: "atlas", name: "Atlas", role: "Research lead" },
      { id: "scout", name: "Scout", role: "Market analyst" },
    ],
  },
  {
    id: "build",
    name: "Build",
    position: { x: 392, y: 190 },
    agents: [
      { id: "forge", name: "Forge", role: "Systems builder" },
      { id: "pixel", name: "Pixel", role: "Interface engineer" },
    ],
  },
  {
    id: "review",
    name: "Review",
    position: { x: 684, y: 80 },
    agents: [
      { id: "sentry", name: "Sentry", role: "Review lead" },
      { id: "patch", name: "Patch", role: "Test engineer" },
    ],
  },
];

const INITIAL_TEAM_FORM: TeamFormState = { open: false, name: "", error: null };
const INITIAL_AGENT_FORM: AgentFormState = {
  open: false,
  name: "",
  role: "",
  nameError: null,
  roleError: null,
};

function avatarInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function nextTeamPosition(zones: TeamZone[]): AgentTeamViewPosition {
  for (let index = 0; ; index += 1) {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const candidate = { x: 96 + 296 * column, y: 88 + 230 * row };
    const hasClearance = zones.every((zone) => Math.hypot(zone.position.x - candidate.x, zone.position.y - candidate.y) >= 180);
    if (hasClearance) return candidate;
  }
}

export function PrimitiveAgentTeamViewExample() {
  const [zones, setZones] = useState<TeamZone[]>(INITIAL_ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>("research");
  const [teamForm, setTeamForm] = useState<TeamFormState>(INITIAL_TEAM_FORM);
  const [agentForm, setAgentForm] = useState<AgentFormState>(INITIAL_AGENT_FORM);
  const selectedZone = zones.find((zone) => zone.id === selectedZoneId);
  const agentCount = zones.reduce((count, zone) => count + zone.agents.length, 0);
  const maxZoneY = zones.reduce((maximum, zone) => Math.max(maximum, zone.position.y), 0);
  const canvasHeight = Math.max(640, maxZoneY + 320);

  function createTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = teamForm.name.trim();
    if (!name) {
      setTeamForm((current) => ({ ...current, error: "Enter a team name." }));
      return;
    }

    const id = crypto.randomUUID();
    const zone: TeamZone = { id, name, position: nextTeamPosition(zones), agents: [] };
    setZones((current) => [...current, zone]);
    setSelectedZoneId(id);
    setTeamForm(INITIAL_TEAM_FORM);
  }

  function addAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = agentForm.name.trim();
    const role = agentForm.role.trim();
    const nameError = name ? null : "Enter an agent name.";
    const roleError = role ? null : "Enter a role.";
    if (nameError || roleError) {
      setAgentForm((current) => ({ ...current, nameError, roleError }));
      return;
    }
    if (!selectedZoneId) return;

    const agent: Agent = { id: crypto.randomUUID(), name, role };
    setZones((current) => current.map((zone) => (zone.id === selectedZoneId ? { ...zone, agents: [...zone.agents, agent] } : zone)));
    setAgentForm(INITIAL_AGENT_FORM);
  }

  return (
    <div className="w-full overflow-hidden rounded-[var(--radius-panel)] bg-canvas ring-1 ring-border">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card p-3 text-foreground">
        <span className="text-sm font-medium">
          {zones.length} teams · {agentCount} agents
        </span>
        <span className="mr-auto text-sm text-muted-foreground">Selected: {selectedZone?.name ?? "None"}</span>
        <Popover
          open={teamForm.open}
          onOpenChange={(open) => setTeamForm((current) => ({ ...current, open, error: open ? current.error : null }))}
        >
          <PopoverTrigger render={<Button size="sm" variant="surface" tone="neutral" />}>New team</PopoverTrigger>
          <PopoverContent align="end">
            <PopoverHeader>
              <PopoverTitle>New team</PopoverTitle>
            </PopoverHeader>
            <form className="flex flex-col gap-4" noValidate onSubmit={createTeam}>
              <Field invalid={teamForm.error !== null}>
                <FieldLabel>Team name</FieldLabel>
                <FieldControl
                  render={
                    <Input
                      required
                      value={teamForm.name}
                      onChange={(event) => setTeamForm((current) => ({ ...current, name: event.target.value, error: null }))}
                    />
                  }
                />
                <FieldError match={teamForm.error !== null}>{teamForm.error}</FieldError>
              </Field>
              <Button type="submit" size="sm" variant="solid" tone="primary">
                Create team
              </Button>
            </form>
          </PopoverContent>
        </Popover>
        <Popover
          open={agentForm.open}
          onOpenChange={(open) =>
            setAgentForm((current) => ({
              ...current,
              open,
              nameError: open ? current.nameError : null,
              roleError: open ? current.roleError : null,
            }))
          }
        >
          <PopoverTrigger render={<Button size="sm" variant="solid" tone="primary" disabled={!selectedZone} />}>Add agent</PopoverTrigger>
          <PopoverContent align="end">
            <PopoverHeader>
              <PopoverTitle>Add agent to {selectedZone?.name}</PopoverTitle>
            </PopoverHeader>
            <form className="flex flex-col gap-4" noValidate onSubmit={addAgent}>
              <Field invalid={agentForm.nameError !== null}>
                <FieldLabel>Agent name</FieldLabel>
                <FieldControl
                  render={
                    <Input
                      required
                      value={agentForm.name}
                      onChange={(event) => setAgentForm((current) => ({ ...current, name: event.target.value, nameError: null }))}
                    />
                  }
                />
                <FieldError match={agentForm.nameError !== null}>{agentForm.nameError}</FieldError>
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
                <FieldError match={agentForm.roleError !== null}>{agentForm.roleError}</FieldError>
              </Field>
              <Button type="submit" size="sm" variant="solid" tone="primary">
                Add agent
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      </div>
      <AgentTeamView className="h-140 rounded-none ring-0 sm:h-150">
        <AgentTeamViewCanvas width={1040} height={canvasHeight}>
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
              <AgentTeamViewZoneHeader>
                <AgentTeamViewZoneDragHandle />
                <AgentTeamViewZoneTitle>{zone.name}</AgentTeamViewZoneTitle>
              </AgentTeamViewZoneHeader>
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
                  <p className="grid min-h-28 place-items-center px-3 text-center text-meta text-muted-foreground">
                    No agents yet — add one from the toolbar.
                  </p>
                )}
              </AgentTeamViewZoneContent>
            </AgentTeamViewZone>
          ))}
        </AgentTeamViewCanvas>
      </AgentTeamView>
    </div>
  );
}
