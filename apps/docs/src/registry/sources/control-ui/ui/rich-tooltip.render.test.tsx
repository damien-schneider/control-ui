import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Button } from "./button";
import {
  RichTooltip,
  RichTooltipNext,
  RichTooltipTour,
  RichTooltipTrigger,
  type TourEndReason,
  type TourValue,
  useTour,
} from "./rich-tooltip";

const steps = ["activity", "pull-requests", "sites"];

function renderTour(step: string | null, onStepChange: (step: string | null) => void, onComplete: (reason: TourEndReason) => void) {
  const captured: { tour: TourValue | null } = { tour: null };
  function Probe() {
    captured.tour = useTour();
    return null;
  }
  renderToString(
    <RichTooltipTour steps={steps} step={step} onStepChange={onStepChange} onComplete={onComplete}>
      <Probe />
    </RichTooltipTour>,
  );
  return captured.tour;
}

describe("RichTooltipTour", () => {
  test("a finished tour does not complete again", () => {
    const changes: (string | null)[] = [];
    let completions = 0;
    const tour = renderTour(
      null,
      (step) => changes.push(step),
      () => {
        completions += 1;
      },
    );

    tour?.finish();
    tour?.next();

    expect(changes).toEqual([]);
    expect(completions).toBe(0);
  });

  test("going back from the first step is not a step change", () => {
    const changes: (string | null)[] = [];
    const tour = renderTour(
      "activity",
      (step) => changes.push(step),
      () => {},
    );

    tour?.previous();
    expect(changes).toEqual([]);

    tour?.next();
    expect(changes).toEqual(["pull-requests"]);
  });

  test("passing the last step completes the tour once", () => {
    const changes: (string | null)[] = [];
    const reasons: TourEndReason[] = [];
    const tour = renderTour(
      "sites",
      (step) => changes.push(step),
      (reason) => reasons.push(reason),
    );

    tour?.next();

    expect(changes).toEqual([null]);
    expect(reasons).toEqual(["completed"]);
  });

  test("a tour ended early reports that it was dismissed", () => {
    const reasons: TourEndReason[] = [];
    const tour = renderTour(
      "activity",
      () => {},
      (reason) => reasons.push(reason),
    );

    tour?.finish("dismissed");

    expect(reasons).toEqual(["dismissed"]);
  });
});

describe("RichTooltip", () => {
  test("a standalone tooltip inside a tour keeps its own dismiss action", () => {
    const html = renderToString(
      <RichTooltipTour steps={steps} step="activity">
        <RichTooltip>
          <RichTooltipNext />
        </RichTooltip>
      </RichTooltipTour>,
    );

    expect(html).toContain("Got it");
    expect(html).not.toContain("Next step");
  });

  test("a tour step offers the next step", () => {
    const html = renderToString(
      <RichTooltipTour steps={steps} step="activity">
        <RichTooltip step="activity">
          <RichTooltipNext />
        </RichTooltip>
      </RichTooltipTour>,
    );

    expect(html).toContain("Next step");
  });

  test("a control composed into the trigger keeps its own family", () => {
    const html = renderToString(
      <RichTooltip>
        <RichTooltipTrigger render={<Button variant="surface" />}>What's new</RichTooltipTrigger>
      </RichTooltip>,
    );

    expect(html).toContain('data-control-family="button"');
    expect(html).toContain('data-slot="trigger"');
  });

  test("a bare trigger carries no popup paint", () => {
    const html = renderToString(
      <RichTooltip>
        <RichTooltipTrigger>What's new</RichTooltipTrigger>
      </RichTooltip>,
    );

    expect(html).toContain('data-slot="trigger"');
    expect(html).not.toContain("data-control-family");
  });
});
