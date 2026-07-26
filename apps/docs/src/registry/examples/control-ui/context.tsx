import { Context } from "@/components/control-ui/context";
import type { ContextSegment } from "@/components/control-ui/contracts";

const segments = [
  { id: "system", label: "System prompt", tokens: 12_000, kind: "system" },
  { id: "tools", label: "Tools", tokens: 18_000, kind: "tool" },
  { id: "messages", label: "Messages", tokens: 52_000, kind: "message" },
  { id: "sources", label: "Sources", tokens: 8_000, kind: "source" },
  { id: "reasoning", label: "Reasoning", tokens: 10_000, kind: "reasoning" },
] satisfies ContextSegment[];

export function ContextExample() {
  return (
    <div className="flex min-h-72 w-full items-end justify-center p-8">
      <Context segments={segments} maxTokens={200_000} model="GPT-5" />
    </div>
  );
}
