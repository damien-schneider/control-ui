import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Command, CommandItem, CommandItemContent, CommandItemDescription, CommandItemTitle, CommandList } from "./command";

const OPTION_TAG = /<div[^>]*role="option"[^>]*>/g;

describe("CommandItem", () => {
  test("announces a disabled item as unavailable", () => {
    const html = renderToString(
      <Command>
        <CommandList>
          <CommandItem value="archive" disabled>
            Archive
          </CommandItem>
          <CommandItem value="rename">Rename</CommandItem>
        </CommandList>
      </Command>,
    );
    const options = [...html.matchAll(OPTION_TAG)].map(([tag]) => tag);

    expect(options).toHaveLength(2);
    expect(options[0]).toContain('aria-disabled="true"');
    expect(options[1]).not.toContain('aria-disabled="true"');
  });

  test("renders the title and description inside the option", () => {
    const html = renderToString(
      <Command>
        <CommandList>
          <CommandItem value="heading">
            <CommandItemContent>
              <CommandItemTitle>Heading 1</CommandItemTitle>
              <CommandItemDescription>Big section heading</CommandItemDescription>
            </CommandItemContent>
          </CommandItem>
        </CommandList>
      </Command>,
    );
    const option = html.slice(html.search(OPTION_TAG));

    expect(option).toMatch(/data-slot="item-title"[^>]*>Heading 1</);
    expect(option).toMatch(/data-slot="item-description"[^>]*>Big section heading</);
  });
});
