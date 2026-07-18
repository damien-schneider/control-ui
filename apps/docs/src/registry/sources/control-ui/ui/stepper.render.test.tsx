import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "./stepper";

function matchCount(value: string, pattern: RegExp) {
  return [...value.matchAll(pattern)].length;
}

function staticSteps() {
  return (
    <StepperList>
      <StepperItem step={0}>
        <StepperIndicator />
        <StepperTitle>Account</StepperTitle>
        <StepperDescription>Choose a login.</StepperDescription>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={1}>
        <StepperIndicator />
        <StepperTitle>Profile</StepperTitle>
        <StepperDescription>Add your details.</StepperDescription>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={2}>
        <StepperIndicator />
        <StepperTitle>Review</StepperTitle>
        <StepperDescription>Confirm your choices.</StepperDescription>
      </StepperItem>
    </StepperList>
  );
}

function contentAttributes(html: string, text: string) {
  return html.match(new RegExp(`<section([^>]*)>${text}</section>`))?.[1] ?? "";
}

function slotAttributeValues(html: string, slot: string, attribute: string) {
  const tags = [...html.matchAll(new RegExp(`<[^>]+data-slot="${slot}"[^>]*>`, "g"))].map((match) => match[0]);
  return tags.map((tag) => tag.match(new RegExp(`\\b${attribute}="([^"]+)"`))?.[1]);
}

describe("Stepper", () => {
  test("renders neutral static steps with default root configuration", () => {
    const html = renderToStaticMarkup(<Stepper>{staticSteps()}</Stepper>);

    expect(html).toContain('data-control-ui="stepper"');
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-orientation="horizontal"');
    expect(html).toContain('data-content-mode="current"');
    expect(html).toContain('data-responsive="true"');
    expect(html).toContain("<ol");
    expect(matchCount(html, /<li\b/g)).toBe(3);
    expect(matchCount(html, /data-state="neutral"/g)).toBeGreaterThanOrEqual(3);
    expect(html).not.toContain('aria-current="step"');
    expect(html).not.toContain("<button");
    expect(html).toContain(">1<");
    expect(html).toContain(">2<");
    expect(html).toContain(">3<");
  });

  test("derives complete, current, and upcoming state from the root value", () => {
    const html = renderToStaticMarkup(<Stepper value={1}>{staticSteps()}</Stepper>);

    expect(matchCount(html, /<li\b[^>]*data-state="complete"/g)).toBe(1);
    expect(matchCount(html, /<li\b[^>]*data-state="current"/g)).toBe(1);
    expect(matchCount(html, /<li\b[^>]*data-state="upcoming"/g)).toBe(1);
    expect(matchCount(html, /aria-current="step"/g)).toBe(1);
    expect(html).toMatch(/<li\b[^>]*data-state="current"[^>]*aria-current="step"/);
  });

  test("treats an explicit null value as controlled neutral state", () => {
    const html = renderToStaticMarkup(<Stepper value={null}>{staticSteps()}</Stepper>);

    expect(matchCount(html, /<li\b[^>]*data-state="neutral"/g)).toBe(3);
    expect(html).not.toContain('aria-current="step"');
  });

  test("uses defaultValue for uncontrolled state", () => {
    const html = renderToStaticMarkup(<Stepper defaultValue={2}>{staticSteps()}</Stepper>);

    expect(matchCount(html, /<li\b[^>]*data-state="complete"/g)).toBe(2);
    expect(matchCount(html, /<li\b[^>]*data-state="current"/g)).toBe(1);
    expect(matchCount(html, /aria-current="step"/g)).toBe(1);
  });

  test("exposes orientation, content mode, and responsive configuration", () => {
    const html = renderToStaticMarkup(
      <Stepper orientation="vertical" contentMode="all" responsive={false}>
        {staticSteps()}
      </Stepper>,
    );

    expect(html).toContain('data-orientation="vertical"');
    expect(html).toContain('data-content-mode="all"');
    expect(html).not.toContain("data-responsive=");
  });

  test("uses native triggers with matching title and content relationships", () => {
    const html = renderToStaticMarkup(
      <Stepper value={0}>
        <StepperList>
          <StepperItem step={0} invalid>
            <StepperTrigger>
              <StepperIndicator />
              <StepperTitle>Account</StepperTitle>
            </StepperTrigger>
          </StepperItem>
          <StepperItem step={1} disabled>
            <StepperTrigger>
              <StepperIndicator />
              <StepperTitle>Profile</StepperTitle>
            </StepperTrigger>
          </StepperItem>
        </StepperList>
        <StepperContent step={0}>Account panel</StepperContent>
        <StepperContent step={1}>Profile panel</StepperContent>
      </Stepper>,
    );

    const buttons = [...html.matchAll(/<button\b([^>]*)>/g)].map((match) => match[1]);
    const titleIds = slotAttributeValues(html, "title", "id");
    const contentIds = slotAttributeValues(html, "content", "id");

    expect(buttons).toHaveLength(2);
    expect(buttons.every((attributes) => attributes.includes('type="button"'))).toBe(true);
    expect(buttons[0]).toContain(`aria-controls="${contentIds[0]}"`);
    expect(buttons[1]).toContain(`aria-controls="${contentIds[1]}"`);
    expect(buttons[0]).not.toMatch(/\sdisabled=""/);
    expect(buttons[1]).toMatch(/\sdisabled=""/);
    expect(contentIds).toHaveLength(2);
    expect(titleIds).toHaveLength(2);
    expect(html).toContain(`aria-labelledby="${titleIds[0]}"`);
    expect(html).toContain(`aria-labelledby="${titleIds[1]}"`);
    expect(html).toMatch(/<li\b[^>]*data-invalid="true"/);
    expect(html).toMatch(/<li\b[^>]*data-disabled="true"/);
    expect(html).toContain("Step 1, invalid");
    expect(html).toContain("Step 2, upcoming, disabled");
  });

  test("preserves inactive content with only inactive panels hidden", () => {
    const html = renderToStaticMarkup(
      <Stepper value={1}>
        <StepperContent step={0}>Account panel</StepperContent>
        <StepperContent step={1}>Profile panel</StepperContent>
        <StepperContent step={2} keepMounted={false}>
          Review panel
        </StepperContent>
      </Stepper>,
    );

    expect(contentAttributes(html, "Account panel")).toContain('hidden=""');
    expect(contentAttributes(html, "Profile panel")).not.toContain("hidden");
    expect(html).not.toContain("Review panel");
    expect(matchCount(html, /data-slot="content"/g)).toBe(2);
  });

  test("shows every panel in all mode regardless of keepMounted", () => {
    const html = renderToStaticMarkup(
      <Stepper value={1} contentMode="all">
        <StepperContent step={0}>Account panel</StepperContent>
        <StepperContent step={1}>Profile panel</StepperContent>
        <StepperContent step={2} keepMounted={false}>
          Review panel
        </StepperContent>
      </Stepper>,
    );

    expect(matchCount(html, /data-slot="content"/g)).toBe(3);
    expect(html).not.toContain('hidden=""');
    expect(html).toContain("Account panel");
    expect(html).toContain("Profile panel");
    expect(html).toContain("Review panel");
  });
});
