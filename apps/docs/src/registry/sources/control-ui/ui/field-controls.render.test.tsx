import { describe, expect, test } from "bun:test";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { InputGroup, InputGroupAddon } from "@/components/control-ui/ui/input-group";
import { Field, FieldLabel } from "./field";
import { Input } from "./input";
import { InputOTP } from "./input-otp";
import { NativeSelect } from "./native-select";
import { Textarea } from "./textarea";

function renderInField(control: ReactElement, tag: string) {
  const html = renderToStaticMarkup(
    <Field>
      <FieldLabel>Label</FieldLabel>
      {control}
    </Field>,
  );
  const controlTag = html.match(new RegExp(`<${tag}\\b[^>]*>`))?.[0] ?? "";
  const labelFor = html.match(/<label[^>]*\bfor="([^"]+)"/)?.[1];
  const controlId = controlTag.match(/\bid="([^"]+)"/)?.[1];
  return { labelFor, controlId };
}

describe("field controls register with Field", () => {
  test.each([
    ["textarea", <Textarea key="textarea" />],
    ["select", <NativeSelect key="select" />],
    [
      "input",
      <InputGroup key="input">
        <InputGroupAddon>@</InputGroupAddon>
        <Input />
      </InputGroup>,
    ],
  ] as const)("%s is labelled by its Field", (tag, control) => {
    const { labelFor, controlId } = renderInField(control, tag);
    expect(controlId).toBeDefined();
    expect(labelFor).toBe(controlId);
  });

  test("an input inside a group keeps field identity over caller attributes", () => {
    const html = renderToStaticMarkup(
      <InputGroup>
        <Input data-slot="custom" data-control-family="custom" />
      </InputGroup>,
    );
    expect(html).toMatch(/<input[^>]*data-slot="input"/);
    expect(html).toMatch(/<input[^>]*data-control-family="field"/);
  });

  test("InputOTP names its first slot from aria-label", () => {
    const html = renderToStaticMarkup(<InputOTP length={4} aria-label="Verification code" />);
    const labelId = html.match(/<span id="([^"]+)" hidden="">Verification code<\/span>/)?.[1];
    const inputs = html.match(/<input\b[^>]*>/g) ?? [];
    expect(labelId).toBeDefined();
    expect(inputs[0]).toContain(`aria-labelledby="${labelId}"`);
    expect(inputs[0]).not.toContain("aria-label=");
    expect(inputs[1]).toContain('aria-label="Character 2 of 4"');
  });
});
