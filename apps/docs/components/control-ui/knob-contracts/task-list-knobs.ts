// Generated from src/registry/sources/control-ui/recipes/task-list.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const taskListKnobs = [
  "--cui-task-list-radius",
  "--cui-task-list-background",
  "--cui-task-list-foreground",
  "--cui-task-list-border-color",
  "--cui-task-list-shadow",
  "--cui-task-list-item-foreground",
  "--cui-task-list-item-pending-foreground",
  "--cui-task-list-indicator-foreground",
  "--cui-task-list-indicator-active-foreground",
] as const;
export type TaskListKnobStyle = Partial<Record<(typeof taskListKnobs)[number], string>>;
