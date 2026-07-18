import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const SKINS = ["refined", "xp", "flat", "rig", "liquid-metal", "modern-apple", "cuicui", "linear"];
const MODES = ["light", "dark"] as const;
const SYNTAX_TOKENS = [
  "--code-foreground",
  "--code-token-constant",
  "--code-token-string",
  "--code-token-string-expression",
  "--code-token-comment",
  "--code-token-keyword",
  "--code-token-parameter",
  "--code-token-function",
  "--code-token-punctuation",
  "--code-token-link",
];
const DOCS_ROOT = fileURLToPath(new URL("../", import.meta.url));
const CODE_THEME = readFileSync(path.join(DOCS_ROOT, "src/registry/sources/control-ui/code.css"), "utf8");
const SKIN_THEMES = SKINS.map((skin) => readFileSync(path.join(DOCS_ROOT, "src/registry/skin-packs", skin, "theme.css"), "utf8")).join(
  "\n",
);

test.beforeEach(async ({ page }) => {
  await page.setContent("<!doctype html><html><body></body></html>");
  await page.addStyleTag({ content: `${SKIN_THEMES}\n${CODE_THEME}` });
});

test("shared code colors clear WCAG AA across every skin and mode", async ({ page }) => {
  for (const skin of SKINS) {
    for (const mode of MODES) {
      const results = await page.evaluate(
        ({ activeSkin, activeMode, syntaxTokens }) => {
          document.documentElement.dataset.skin = activeSkin;
          document.documentElement.classList.toggle("dark", activeMode === "dark");

          const styles = getComputedStyle(document.documentElement);
          const canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const context = canvas.getContext("2d", { willReadFrequently: true });
          if (!context) throw new Error("Canvas 2D context unavailable");
          const drawingContext = context;

          function pixel(layers: string[]): [number, number, number] {
            drawingContext.clearRect(0, 0, 1, 1);
            for (const color of layers) {
              drawingContext.fillStyle = color;
              drawingContext.fillRect(0, 0, 1, 1);
            }
            const [red, green, blue] = drawingContext.getImageData(0, 0, 1, 1).data;
            return [red, green, blue];
          }

          function luminance([red, green, blue]: [number, number, number]): number {
            const channel = (value: number) => {
              const normalized = value / 255;
              return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
            };
            return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
          }

          function contrast(foreground: [number, number, number], background: [number, number, number]): number {
            const foregroundLuminance = luminance(foreground);
            const backgroundLuminance = luminance(background);
            return (
              (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
            );
          }

          const surface = styles.getPropertyValue("--muted").trim();
          const addition = styles.getPropertyValue("--diff-add-line").trim();
          const deletion = styles.getPropertyValue("--diff-del-line").trim();
          const backgrounds = {
            context: pixel([surface]),
            addition: pixel([surface, addition]),
            deletion: pixel([surface, deletion]),
          };

          return syntaxTokens.flatMap((token) => {
            const foreground = pixel([styles.getPropertyValue(token).trim()]);
            return Object.entries(backgrounds).map(([background, backgroundColor]) => ({
              token,
              background,
              ratio: contrast(foreground, backgroundColor),
            }));
          });
        },
        { activeSkin: skin, activeMode: mode, syntaxTokens: SYNTAX_TOKENS },
      );

      for (const result of results) {
        expect.soft(result.ratio, `${skin} ${mode} ${result.token} on ${result.background}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  }
});

test("dark code tokens follow root, ancestor, and same-element dark scopes", async ({ page }) => {
  for (const skin of SKINS) {
    const values = await page.evaluate((activeSkin) => {
      const root = document.documentElement;
      const tokenNames = ["--code-token-keyword", "--diff-add-line", "--diff-del-line"];
      const read = (element: Element) => tokenNames.map((token) => getComputedStyle(element).getPropertyValue(token).trim());

      root.dataset.skin = activeSkin;
      root.classList.add("dark");
      const rootDark = read(root);

      root.classList.remove("dark");
      delete root.dataset.skin;

      const ancestor = document.createElement("div");
      ancestor.className = "dark";
      const nested = document.createElement("div");
      nested.dataset.skin = activeSkin;
      ancestor.append(nested);
      document.body.append(ancestor);
      const ancestorDark = read(nested);
      ancestor.remove();

      const sameElement = document.createElement("div");
      sameElement.className = "dark";
      sameElement.dataset.skin = activeSkin;
      document.body.append(sameElement);
      const sameElementDark = read(sameElement);
      sameElement.remove();

      return { rootDark, ancestorDark, sameElementDark };
    }, skin);

    expect(values.ancestorDark, `${skin} nested dark scope`).toEqual(values.rootDark);
    expect(values.sameElementDark, `${skin} same-element dark scope`).toEqual(values.rootDark);
  }
});
