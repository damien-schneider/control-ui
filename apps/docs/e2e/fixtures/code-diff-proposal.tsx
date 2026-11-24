import { createRoot } from "react-dom/client";
import { CodeDiff } from "@/components/control-ui/ui/code-diff";

const before = [
  "# Agents",
  "",
  "## Engineering",
  "",
  "- Duplication cheaper than wrong abstraction: code that merely looks alike stays copied until a third case shows the shape — abstracting early costs more. The same concept written twice is not a look-alike: name it once.",
  "- SSOT: one fact, one place — everything else derives; two places that must change together are one source. Grep before adding a value.",
  "- Design for deletion: loose coupling, disposable modules — not extensible everywhere.",
  "- Naming = design: hard to name = wrong shape.",
  "",
  "## Robustness",
  "",
  "Anything touching I/O, state, or effects follows the seven invariants.",
].join("\n");

const after = [
  "# Agents",
  "",
  "## Engineering",
  "",
  "- **Name a concept once.** The same idea written twice drifts apart; give it one home and derive the rest.",
  "- **Copy look-alikes until a third case.** Code that only looks alike stays copied; abstracting early costs more than duplication.",
  "- Design for deletion: loose coupling, disposable modules — not extensible everywhere.",
  "- Naming = design: hard to name = wrong shape.",
  "",
  "## Robustness",
  "",
  "Anything touching I/O, state, or effects follows the seven invariants.",
].join("\n");

const parameters = new URLSearchParams(location.search);

function Fixture() {
  return (
    <div style={{ inlineSize: Number(parameters.get("width") ?? 560), padding: 24 }}>
      <CodeDiff
        name="AGENTS.md"
        oldText={parameters.get("same") ? after : before}
        newText={after}
        overflow="wrap"
        maxHeight={parameters.get("max") ?? "10rem"}
      />
    </div>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<Fixture />);
