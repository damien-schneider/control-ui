import { expect, type Page, test } from "@playwright/test";
import { type AriaPattern, checkPattern } from "./aria-patterns";
import { waitForReactHydration } from "./browser-test-helpers";

type Target = { component: string; pattern: AriaPattern; roots: string; triggers?: boolean };

const preview = "#preview";

const targets: Target[] = [
  { component: "accordion", pattern: "accordion", roots: `${preview} [data-control-ui="accordion"][data-slot="root"]` },
  {
    component: "alert-dialog",
    pattern: "alertdialog",
    roots: `${preview} [data-control-ui="alert-dialog"][data-slot="trigger"]`,
    triggers: true,
  },
  { component: "autocomplete", pattern: "combobox", roots: preview },
  { component: "checkbox", pattern: "checkbox", roots: preview },
  { component: "collapsible", pattern: "disclosure", roots: preview },
  { component: "combobox", pattern: "combobox", roots: preview },
  { component: "command", pattern: "combobox", roots: preview },
  { component: "dialog", pattern: "dialog", roots: `${preview} [data-control-ui="dialog"][data-slot="trigger"]`, triggers: true },
  { component: "drawer", pattern: "dialog", roots: `${preview} [data-control-ui="drawer"][data-slot="trigger"]`, triggers: true },
  { component: "dropdown-menu", pattern: "menu", roots: preview },
  { component: "menubar", pattern: "menubar", roots: preview },
  { component: "radio-group", pattern: "radio-group", roots: preview },
  { component: "select", pattern: "select", roots: preview },
  { component: "slider", pattern: "slider", roots: preview },
  { component: "switch", pattern: "switch", roots: preview },
  { component: "tabs", pattern: "tabs", roots: `${preview} [role="tabpanel"] [data-control-ui="tabs"][data-slot="root"]` },
  { component: "toolbar", pattern: "toolbar", roots: preview },
  { component: "tree", pattern: "tree", roots: preview },
];

/** Checks every root; policy problems, where APG leaves the behavior optional, become annotations and the rest are returned. */
async function apgFailures(page: Page, { pattern, roots, triggers }: Target) {
  const scope = page.locator(preview);
  const count = await page.locator(roots).count();
  expect(count, `no element matches ${roots}`).toBeGreaterThan(0);
  const failures: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const root = page.locator(roots).nth(index);
    const problems = await checkPattern(triggers ? scope : root, pattern, triggers ? { trigger: root } : {});
    for (const { subject, message, policy } of problems) {
      const line = `#${index + 1} ${subject}: ${message}`;
      if (policy) test.info().annotations.push({ type: "aria-policy", description: line });
      else failures.push(line);
    }
  }
  return failures;
}

for (const target of targets) {
  test(`${target.component} follows the ${target.pattern} pattern`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto(`/components/${target.component}`);
    const scope = page.locator(preview);
    await expect(scope).toBeVisible();
    await waitForReactHydration(scope.locator("[data-control-ui]").first());
    const failures = await apgFailures(page, target);
    expect(failures, failures.join("\n")).toEqual([]);
  });
}
