import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Command, CommandItem, CommandList } from "./command";

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
});
