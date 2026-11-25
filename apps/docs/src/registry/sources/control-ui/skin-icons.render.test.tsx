import { expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ControlUiSkin, SkinIconProps } from "@/components/control-ui/skin";
import { SkinProvider } from "@/components/control-ui/skin-provider";
import { PopupCloseButton } from "./popup-parts";
import { Accordion, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { NumberField, NumberFieldDecrement, NumberFieldGroup, NumberFieldIncrement, NumberFieldInput } from "./ui/number-field";
import { Select, SelectTrigger, SelectValue } from "./ui/select";
import { Spinner } from "./ui/spinner";

function PenGlyph(props: SkinIconProps) {
  return <svg data-pen-glyph="true" {...props} />;
}

const skin: ControlUiSkin = {
  id: "pen",
  icons: { chevronDown: PenGlyph, close: PenGlyph, minus: PenGlyph, plus: PenGlyph, spinner: PenGlyph },
};

function renderWithSkin(children: ReactNode) {
  return renderToStaticMarkup(<SkinProvider skin={skin}>{children}</SkinProvider>);
}

const skinnedCases: { name: string; element: ReactNode }[] = [
  { name: "Spinner", element: <Spinner /> },
  { name: "PopupCloseButton", element: <PopupCloseButton label="Close" /> },
  {
    name: "Select chevron",
    element: (
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
      </Select>
    ),
  },
  {
    name: "Accordion chevron",
    element: (
      <Accordion>
        <AccordionItem value="one">
          <AccordionTrigger>One</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    ),
  },
];

for (const { name, element } of skinnedCases) {
  test(`${name} draws its built-in glyph without a skin and the skin glyph with one`, () => {
    expect(renderToStaticMarkup(element)).not.toContain("data-pen-glyph");
    expect(renderWithSkin(element)).toContain('data-pen-glyph="true"');
  });
}

test("skin glyphs receive the props the default glyph would receive", () => {
  const html = renderWithSkin(<Spinner size="lg" />);
  expect(html).toContain('<svg data-pen-glyph="true" aria-hidden="true" data-control-ui="spinner"');
  expect(html).toContain('data-slot="indicator" data-size="lg"');
});

test("instance children win over the skin glyph", () => {
  const html = renderWithSkin(
    <NumberField>
      <NumberFieldGroup>
        <NumberFieldDecrement>
          <span data-instance-icon="true" />
        </NumberFieldDecrement>
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldGroup>
    </NumberField>,
  );
  expect(html).toContain('data-instance-icon="true"');
  expect(html.match(/data-pen-glyph/g)).toHaveLength(1);
});

test("keys a skin leaves out keep the built-in glyph", () => {
  const html = renderToStaticMarkup(
    <SkinProvider skin={{ id: "partial", icons: { close: PenGlyph } }}>
      <Spinner />
    </SkinProvider>,
  );
  expect(html).not.toContain("data-pen-glyph");
  expect(html).toContain("<svg");
});
