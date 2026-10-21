import { describe, expect, test } from "bun:test";
import { gzipSync } from "node:zlib";
import themeInitScript from "@/app/(features)/theme/generated-theme-init.json";
import {
  COLOR_SCHEME_LOCK_ATTR,
  DEFAULT_SKIN_ID,
  MODE_LOCKED_SKINS,
  PAGE_LAYOUT_SKINS,
  THEME_EDITOR_STORAGE_KEY,
  THEME_INIT_SKIN_IDS,
  THEME_STORAGE_KEY,
} from "@/components/theme";

class FakeElement {
  id = "";
  textContent = "";
  rel = "";
  href = "";
  connected = false;
  readonly dataset: Record<string, string> = {};
  readonly attributes = new Map<string, string>();
  readonly classes = new Set<string>();
  readonly classList = {
    contains: (name: string) => this.classes.has(name),
    toggle: (name: string, force = !this.classes.has(name)) => {
      if (force) this.classes.add(name);
      else this.classes.delete(name);
      return force;
    },
  };
  readonly properties = new Map<string, string>();
  readonly style = {
    colorScheme: "",
    setProperty: (name: string, value: string) => this.properties.set(name, value),
    getPropertyValue: (name: string) => this.properties.get(name) ?? "",
    removeProperty: (name: string) => this.properties.delete(name),
  };
  remove = () => {};
  get isConnected() {
    return this.connected;
  }
  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  hasAttribute(name: string) {
    return this.attributes.has(name);
  }
  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
}

type StoredValues = Record<string, string>;

function runThemeInit({
  stored = {},
  search = "",
  prefersDark = false,
  storageBlocked = false,
}: {
  stored?: StoredValues;
  search?: string;
  prefersDark?: boolean;
  storageBlocked?: boolean;
}) {
  const html = new FakeElement();
  const headChildren: FakeElement[] = [];
  const appendToHead = (element: FakeElement) => {
    element.connected = true;
    element.remove = () => {
      element.connected = false;
      headChildren.splice(headChildren.indexOf(element), 1);
    };
    headChildren.push(element);
  };
  const document = {
    documentElement: html,
    head: {
      append: appendToHead,
      appendChild: appendToHead,
      get lastElementChild() {
        return headChildren.at(-1) ?? null;
      },
    },
    createElement: () => new FakeElement(),
    querySelector: (selector: string) => headChildren.find((element) => `#${element.id}` === selector) ?? null,
  };
  const window = { location: { search }, matchMedia: () => ({ matches: prefersDark }) };
  const localStorage = {
    getItem: (key: string) => {
      if (storageBlocked) throw new DOMException("Storage is disabled", "SecurityError");
      return stored[key] ?? null;
    },
  };
  const runScript = new Function("window", "document", "localStorage", "getComputedStyle", "requestAnimationFrame", themeInitScript);
  runScript(
    window,
    document,
    localStorage,
    () => ({ colorScheme: "" }),
    (callback: () => void) => callback(),
  );
  return { html, headChildren };
}

test("pre-paint restoration stays below 6 KiB compressed", () => {
  expect(gzipSync(themeInitScript).byteLength).toBeLessThanOrEqual(6 * 1024);
});

describe("pre-paint theme restoration", () => {
  for (const skin of THEME_INIT_SKIN_IDS) {
    test(`${skin} restores its saved edits, mode, motion, and layout`, () => {
      const { html } = runThemeInit({
        stored: {
          [THEME_STORAGE_KEY]: "dark",
          [THEME_EDITOR_STORAGE_KEY]: JSON.stringify({
            skin,
            reduceMotion: true,
            overrides: { "--radius-control": "13px" },
            light: { "--primary": "oklch(0.65 0.15 40)" },
            dark: { "--background": "oklch(0.2 0.01 50)" },
            textFixes: { "--muted-foreground": "#777777" },
          }),
        },
      });
      const lockedScheme = MODE_LOCKED_SKINS[skin];

      expect(html.dataset.skin).toBe(skin);
      expect(html.dataset.motion).toBe("reduced");
      expect(html.dataset.docsLayout).toBe(PAGE_LAYOUT_SKINS.includes(skin) ? "page" : "contained");
      expect(html.classList.contains("dark")).toBe(lockedScheme !== "light");
      expect(html.getAttribute(COLOR_SCHEME_LOCK_ATTR)).toBe(lockedScheme ?? null);
      expect(html.style.getPropertyValue("--radius-control")).toBe("13px");
      expect(html.style.getPropertyValue("--primary")).not.toBe("");
      expect(html.style.getPropertyValue("--muted-foreground")).toMatch(/^oklch\(/);
      expect(html.style.getPropertyValue("--background")).toBe(lockedScheme === "light" ? "" : "oklch(0.2 0.01 50)");
    });
  }

  for (const saved of ["not json", "null", '{"skin":"toString"}']) {
    test(`invalid saved theme ${saved} falls back to the default skin`, () => {
      const { html } = runThemeInit({ stored: { [THEME_EDITOR_STORAGE_KEY]: saved } });
      expect(html.dataset.skin).toBe(DEFAULT_SKIN_ID);
      expect(html.style.getPropertyValue("--radius-control")).toBe("");
    });
  }

  test("blocked storage still honors the system color scheme", () => {
    const { html } = runThemeInit({ storageBlocked: true, prefersDark: true });
    expect(html.dataset.skin).toBe(DEFAULT_SKIN_ID);
    expect(html.classList.contains("dark")).toBe(true);
    expect(html.dataset.motion).not.toBe("reduced");
  });

  for (const skin of ["windows-98", "none"]) {
    test(`a shared ${skin} preset replaces saved skin edits before paint`, () => {
      const { html, headChildren } = runThemeInit({
        search: `?skin=${skin}&source=shared`,
        stored: {
          [THEME_STORAGE_KEY]: "dark",
          [THEME_EDITOR_STORAGE_KEY]: JSON.stringify({
            skin: "refined",
            customSkinId: "saved-custom-skin",
            overrides: { "--radius-control": "13px" },
            knobs: [{ selector: "[data-control-family=button]", tokens: { "--cui-button-radius": "13px" } }],
          }),
        },
      });
      expect(html.dataset.skin).toBe(skin);
      expect(html.classList.contains("dark")).toBe(MODE_LOCKED_SKINS[skin] !== "light");
      expect(html.style.getPropertyValue("--radius-control")).toBe("");
      expect(headChildren.some((element) => element.id === "control-ui-editor-overrides")).toBe(false);
    });
  }
});
