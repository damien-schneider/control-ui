import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { useMorphTransition } from "./use-morph-transition";

function Probe({ open, name }: { open: boolean; name?: string }) {
  const { triggerProps, surfaceProps } = useMorphTransition({ open, name });

  return (
    <div>
      <button type="button" data-testid="trigger" {...triggerProps} />
      <div data-testid="surface" {...surfaceProps} />
    </div>
  );
}

function morphNames(html: string) {
  return html.match(/--morph-name/g) ?? [];
}

describe("useMorphTransition", () => {
  // The View Transitions API aborts the whole transition when two live elements claim one name, so the
  // alternation below is the load-bearing invariant — not a styling detail.
  test("hands the shared name to the trigger while closed", () => {
    const html = renderToString(<Probe open={false} name="aui-morph-probe" />);

    expect(morphNames(html)).toHaveLength(1);
    expect(html).toMatch(/data-testid="trigger"[^>]*--morph-name:aui-morph-probe/);
  });

  test("hands the shared name to the surface while open", () => {
    const html = renderToString(<Probe open name="aui-morph-probe" />);

    expect(morphNames(html)).toHaveLength(1);
    expect(html).toMatch(/data-testid="surface"[^>]*--morph-name:aui-morph-probe/);
  });

  test("both ends keep the preset class so the pair is styled from one rule", () => {
    const html = renderToString(<Probe open={false} name="aui-morph-probe" />);

    expect(html.match(/class="morph-surface"/g)).toHaveLength(1);
  });

  // useId ships delimiters (:r1:, «r1») that view-transition-name rejects as a custom-ident.
  test("derives a valid custom-ident when no name is supplied", () => {
    const html = renderToString(<Probe open={false} />);
    const generated = html.match(/--morph-name:([^"';]+)/)?.[1];

    expect(generated).toMatch(/^aui-morph-[a-zA-Z0-9_-]+$/);
  });
});
