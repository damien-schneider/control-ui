// Generated from src/registry/sources/control-ui/recipes/calendar.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const calendarKnobs = [
  "--cui-calendar-day-radius",
  "--cui-calendar-today-background",
  "--cui-calendar-selected-background",
  "--cui-calendar-selected-foreground",
  "--cui-calendar-range-background",
  "--cui-calendar-day-size",
  "--cui-calendar-cell-padding",
  "--cui-calendar-today-shadow",
  "--cui-calendar-weekend-foreground",
  "--cui-calendar-weekend-background",
  "--cui-calendar-caption-font-size",
  "--cui-calendar-caption-font-weight",
  "--cui-calendar-weekday-font-size",
] as const;
export type CalendarKnobStyle = Partial<Record<(typeof calendarKnobs)[number], string>>;
