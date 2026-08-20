import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import type { ButtonProps } from "@/components/control-ui/contracts";
import { ButtonLabel, ButtonLink } from "./button";

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

describe("Button knob style types", () => {
  test("rejects custom properties outside the public knob contract", () => {
    // @ts-expect-error Unknown custom property must fail contextual style typing.
    const invalidStyle: ButtonProps["style"] = { "--button-not-a-knob": "red" };

    expect(invalidStyle).toBeDefined();
  });
});
