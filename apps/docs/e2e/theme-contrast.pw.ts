import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const SKINS = ["refined", "xp", "flat", "rig", "liquid-metal", "modern-apple", "cuicui", "linear"];
const MODES = ["light", "dark"] as const;
const BADGE_COLORS = [
  "neutral",
  "slate",
  "gray",
  "zinc",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];
const DOCS_ROOT = fileURLToPath(new URL("../", import.meta.url));
const TAILWIND_PALETTE = readFileSync(path.join(DOCS_ROOT, "node_modules/tailwindcss/theme.css"), "utf8").replace(
  "@theme default",
  ":root",
);
const SKIN_THEMES = SKINS.map((skin) => readFileSync(path.join(DOCS_ROOT, "src/registry/skin-packs", skin, "theme.css"), "utf8")).join(
  "\n",
);

test("semantic fills and badges clear WCAG AA across every skin and mode", async ({ page }) => {
  await page.setContent("<!doctype html><html><body></body></html>");
  await page.addStyleTag({ content: `${TAILWIND_PALETTE}\n${SKIN_THEMES}` });
  const violations: string[] = [];

  for (const skin of SKINS) {
    for (const mode of MODES) {
      const results = await page.evaluate(
        ({ activeSkin, activeMode, badgeColors }) => {
          const root = document.documentElement;
          root.dataset.skin = activeSkin;
          root.classList.toggle("dark", activeMode === "dark");

          const canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const context = canvas.getContext("2d", { willReadFrequently: true });
          if (!context) throw new Error("Canvas 2D context unavailable");
          const drawingContext = context;

          function pixel(layers: string[]): [number, number, number] {
            drawingContext.clearRect(0, 0, 1, 1);
            layers.forEach((color) => {
              drawingContext.fillStyle = color;
              drawingContext.fillRect(0, 0, 1, 1);
            });
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

          function resolvedPair(foreground: string, background: string, surface = "--background") {
            const pageSurface = document.createElement("div");
            pageSurface.style.backgroundColor = "var(--background)";
            const container = document.createElement("div");
            container.style.backgroundColor = `var(${surface})`;
            const probe = document.createElement("span");
            probe.style.color = `var(${foreground})`;
            probe.style.backgroundColor = `var(${background})`;
            container.append(probe);
            pageSurface.append(container);
            document.body.append(pageSurface);
            const pageSurfaceColor = getComputedStyle(pageSurface).backgroundColor;
            const containerColor = getComputedStyle(container).backgroundColor;
            const styles = getComputedStyle(probe);
            const ratio = contrast(pixel([styles.color]), pixel([pageSurfaceColor, containerColor, styles.backgroundColor]));
            pageSurface.remove();
            return ratio;
          }

          function resolvedText(foreground: string, surface: string) {
            const pageSurface = document.createElement("div");
            pageSurface.style.backgroundColor = "var(--background)";
            const container = document.createElement("div");
            container.style.backgroundColor = `var(${surface})`;
            const probe = document.createElement("span");
            probe.style.color = `var(${foreground})`;
            container.append(probe);
            pageSurface.append(container);
            document.body.append(pageSurface);
            const pageSurfaceColor = getComputedStyle(pageSurface).backgroundColor;
            const containerColor = getComputedStyle(container).backgroundColor;
            const foregroundColor = getComputedStyle(probe).color;
            const ratio = contrast(pixel([foregroundColor]), pixel([pageSurfaceColor, containerColor]));
            pageSurface.remove();
            return ratio;
          }

          const semanticPairs = [
            {
              label: "primary",
              ratio: resolvedPair("--primary-foreground", "--primary"),
            },
            {
              label: "destructive",
              ratio: resolvedPair("--destructive-foreground", "--destructive"),
            },
            {
              label: "secondary",
              ratio: resolvedPair("--secondary-foreground", "--secondary"),
            },
            {
              label: "accent",
              ratio: resolvedPair("--accent-foreground", "--accent"),
            },
            {
              label: "body text on background",
              ratio: resolvedText("--foreground", "--background"),
            },
            {
              label: "body text on canvas",
              ratio: resolvedText("--foreground", "--canvas"),
            },
            {
              label: "card text",
              ratio: resolvedText("--card-foreground", "--card"),
            },
            {
              label: "muted text on background",
              ratio: resolvedText("--muted-foreground", "--background"),
            },
            {
              label: "muted text on card",
              ratio: resolvedText("--muted-foreground", "--card"),
            },
          ];

          const semanticTextPairs = ["primary", "destructive"].flatMap((color) =>
            ["--background", "--card"].map((surface) => ({
              label: `${color} text on ${surface}`,
              ratio: resolvedText(`--${color}-text`, surface),
            })),
          );

          const badgePairs = badgeColors.flatMap((color) =>
            ["--background", "--card"].flatMap((surface) => [
              {
                label: `badge ${color} base on ${surface}`,
                ratio: resolvedPair(`--badge-${color}-foreground`, `--badge-${color}`, surface),
              },
              {
                label: `badge ${color} hover on ${surface}`,
                ratio: resolvedPair(`--badge-${color}-foreground`, `--badge-${color}-hover`, surface),
              },
            ]),
          );

          return [...semanticPairs, ...semanticTextPairs, ...badgePairs];
        },
        { activeSkin: skin, activeMode: mode, badgeColors: BADGE_COLORS },
      );

      for (const result of results) {
        if (result.ratio < 4.5) violations.push(`${skin} ${mode} ${result.label}: ${result.ratio.toFixed(2)}`);
      }
    }
  }

  expect(violations).toEqual([]);
});
