"use client";

// No <Text> component — the utility goes directly on the semantic tag.

export function TypographyTokensExample() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <p className="text-display font-display">Display — page titles &amp; heroes</p>
      <h1 className="text-heading-1 font-display">Heading 1 — content h1</h1>
      <h2 className="text-heading-2 font-display">One rung per size, named by role</h2>
      <h3 className="text-heading-3 font-display">Applied straight to the element</h3>
      <h4 className="text-heading-4 font-display">No component, just the utility on the tag</h4>
      <p className="text-body-lg">
        Body large sets the emphasized reading size — intros, lead paragraphs, and anywhere copy needs a little more presence than the
        default.
      </p>
      <p className="text-body">
        Body is the default for paragraphs, controls, and most of the interface. The five boxing wizards jump quickly, and the quick brown
        fox jumps over the lazy dog.
      </p>
      <p className="text-label text-muted-foreground">Label — form labels and small chrome.</p>
      <p className="text-caption text-muted-foreground">Caption — overlines, timestamps, and group labels.</p>
      <p className="text-micro text-muted-foreground">Micro — keycaps, badge counters, and dense metadata.</p>
    </div>
  );
}
