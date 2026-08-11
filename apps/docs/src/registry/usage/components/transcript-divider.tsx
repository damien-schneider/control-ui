import { TranscriptDivider } from "@/components/control-ui/transcript-divider";

type RunBoundary = {
  id: string;
  kind: "condensed" | "interrupted" | "failed";
  summary: string;
};

const boundaryTone = {
  condensed: "neutral",
  interrupted: "warning",
  failed: "danger",
} as const;

export function Example({ boundaries }: { boundaries: RunBoundary[] }) {
  return (
    <>
      {boundaries.map((boundary) => (
        <TranscriptDivider key={boundary.id} tone={boundaryTone[boundary.kind]}>
          {boundary.summary}
        </TranscriptDivider>
      ))}
    </>
  );
}
