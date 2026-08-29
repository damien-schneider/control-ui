import { describe, expect, test } from "bun:test";
import { compositionTreeFromExample } from "@/app/(features)/model/composition-from-example";

const PARTS = ["Menu", "MenuTrigger", "MenuContent", "MenuItem", "MenuSeparator"];

describe("compositionTreeFromExample", () => {
  test("nests parts and merges repeated siblings", () => {
    const code = `<Menu>
      <MenuTrigger>File</MenuTrigger>
      <MenuContent>
        <MenuItem>New</MenuItem>
        <MenuSeparator />
        <MenuItem>Open</MenuItem>
      </MenuContent>
    </Menu>`;

    expect(compositionTreeFromExample(code, PARTS)?.code).toBe(
      ["Menu", "├── MenuTrigger", "└── MenuContent", "    ├── MenuItem", "    └── MenuSeparator"].join("\n"),
    );
  });

  test("reads through generics, JSX props and arrow bodies", () => {
    const code = `<Menu<string> onSelect={(value) => value > 1} trigger={<MenuTrigger />}>
      <MenuItem />
    </Menu>`;

    expect(compositionTreeFromExample(code, PARTS)?.code).toBe(["Menu", "└── MenuItem"].join("\n"));
  });

  test("ignores parts mentioned in comments", () => {
    const code = `// pair it with <MenuTrigger label>
    <Menu>
      <MenuItem />
    </Menu>`;

    expect(compositionTreeFromExample(code, PARTS)?.code).toBe(["Menu", "└── MenuItem"].join("\n"));
  });

  test("reports parts the example never composes", () => {
    const code = "<Menu><MenuItem /></Menu>";

    expect(compositionTreeFromExample(code, PARTS)?.unusedParts).toEqual(["MenuTrigger", "MenuContent", "MenuSeparator"]);
  });

  test("returns nothing when the example shows no nesting", () => {
    expect(compositionTreeFromExample("<Menu />", PARTS)).toBeUndefined();
  });
});
