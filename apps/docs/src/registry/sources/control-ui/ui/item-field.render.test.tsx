import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "./field";
import { Item, ItemContent, ItemFooter, ItemGroup, ItemHeader, ItemSeparator } from "./item";

describe("grouped item and field anatomy", () => {
  test("ItemGroup exposes list and separator anatomy", () => {
    const html = renderToStaticMarkup(
      <ItemGroup>
        <Item>First</Item>
        <ItemSeparator />
        <Item>Second</Item>
      </ItemGroup>,
    );

    expect(html).toContain('role="list"');
    expect(html).toContain('data-slot="group"');
    expect(html).toContain('data-slot="separator"');
  });

  test("Item wraps so its header and footer take their own rows", () => {
    const html = renderToStaticMarkup(
      <Item>
        <ItemHeader>Header</ItemHeader>
        <ItemContent>Content</ItemContent>
        <ItemFooter>Footer</ItemFooter>
      </Item>,
    );

    expect(html).toMatch(/data-slot="root"[^>]*class="[^"]*\bflex-wrap\b/);
    expect(html).toMatch(/data-slot="header"[^>]*class="[^"]*\bbasis-full\b/);
    expect(html).toMatch(/data-slot="footer"[^>]*class="[^"]*\bbasis-full\b/);
  });

  test("Field supports responsive content and separators", () => {
    const html = renderToStaticMarkup(
      <FieldGroup>
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel htmlFor="updates">Updates</FieldLabel>
            <FieldDescription>Receive release updates.</FieldDescription>
          </FieldContent>
          <button id="updates" type="button">
            Toggle
          </button>
        </Field>
        <FieldSeparator />
      </FieldGroup>,
    );

    expect(html).toContain('data-orientation="responsive"');
    expect(html).toContain('data-slot="content"');
    expect(html).toContain('data-slot="separator"');
    expect(html).toContain('for="updates"');
  });
});
