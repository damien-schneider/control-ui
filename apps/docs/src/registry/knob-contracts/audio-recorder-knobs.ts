// Generated from src/registry/sources/control-ui/recipes/audio-recorder.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const audioRecorderKnobs = [
  "--cui-audio-recorder-foreground",
  "--cui-audio-recorder-recording-foreground",
  "--cui-audio-recorder-recorded-foreground",
  "--cui-audio-recorder-recording-ring-color",
  "--cui-audio-recorder-error-foreground",
  "--cui-audio-recorder-meta-foreground",
] as const;
export type AudioRecorderKnobStyle = Partial<Record<(typeof audioRecorderKnobs)[number], string>>;
