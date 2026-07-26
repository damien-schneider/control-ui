import type { SourceReference } from "@/components/control-ui/contracts";
import { InlineCitation } from "@/components/control-ui/inline-citation";

const sources = [
  {
    href: "https://docs.example.com/retrieval",
    title: "Retrieval guide",
    description: "How the system finds and ranks relevant documents.",
  },
  {
    href: "https://docs.example.com/citations",
    title: "Citation guide",
    description: "How source metadata is attached to generated answers.",
  },
] satisfies SourceReference[];

export function Example() {
  return (
    <p>
      The answer can cite several references without turning every source into a permanent panel
      <InlineCitation sources={sources} />.
    </p>
  );
}
