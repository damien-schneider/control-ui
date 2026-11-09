import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import type { ButtonProps } from "@/components/control-ui/ui/button";
import { Button, ButtonLabel, ButtonLink } from "./button";
import { HoverCard, HoverCardTrigger } from "./hover-card";

describe("ButtonLink rendered element", () => {
  test("renders navigation without button semantics", () => {
    const html = renderToString(<ButtonLink href="/docs">Documentation</ButtonLink>);

    expect(html).toStartWith("<a");
    expect(html).toContain('href="/docs"');
    expect(html).not.toContain('role="button"');
    expect(html).not.toContain("<button");
  });
});

describe("ButtonLabel rendered element", () => {
  test("labels its nested control without adding button semantics", () => {
    const html = renderToString(
      <ButtonLabel htmlFor="theme-file">
        Import theme
        <input id="theme-file" type="file" />
      </ButtonLabel>,
    );

    expect(html).toStartWith("<label");
    expect(html).toContain('for="theme-file"');
    expect(html).not.toContain('role="button"');
  });
});

describe("Button rendered by a popup trigger", () => {
  test("keeps the family its recipe is keyed on", () => {
    const html = renderToString(
      <HoverCard>
        <HoverCardTrigger render={<Button variant="surface" />}>Ada</HoverCardTrigger>
      </HoverCard>,
    );

    expect(html).toStartWith("<button");
    expect(html).toContain('data-control-family="button"');
    expect(html).not.toContain('data-control-family="popup"');
  });
});

describe("Button used as a part of another control", () => {
  test("takes the family that control gives it", () => {
    const html = renderToString(<Button data-control-family="filter-bar" data-slot="segment" />);

    expect(html).toContain('data-control-family="filter-bar"');
    expect(html).not.toContain('data-control-family="button"');
  });
});

describe("Button knob style types", () => {
  test("rejects custom properties outside the public knob contract", () => {
    // @ts-expect-error Unknown custom property must fail contextual style typing.
    const invalidStyle: ButtonProps["style"] = { "--button-not-a-knob": "red" };

    expect(invalidStyle).toBeDefined();
  });
});
