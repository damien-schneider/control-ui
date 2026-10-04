import { expect, type Locator, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

const viewportScale = (viewport: Locator) => viewport.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a);

test("flow paints nodes and edges from its knobs and drives the viewport from its controls", async ({ page }) => {
  const reactFlowWarnings: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("[React Flow]")) reactFlowWarnings.push(message.text());
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/primitives/flow");

  const flow = page.locator('main [data-control-family="flow"][data-slot="root"]');
  const nodes = flow.locator('[data-slot="node"]');
  const edges = flow.locator('[data-slot="edge"]');
  const viewport = flow.locator(".react-flow__viewport");
  await waitForReactHydration(flow);
  await expect(nodes).toHaveCount(5);
  await expect(edges).toHaveCount(5);

  const firstEdge = edges.first();
  const strokes = await firstEdge.evaluate((path) => {
    const style = getComputedStyle(path);
    return { painted: style.stroke, knob: style.getPropertyValue("--cui-flow-edge-stroke").trim() };
  });
  expect(strokes.painted).toBe(strokes.knob);

  const neighbourStroke = await edges.nth(1).evaluate((path) => getComputedStyle(path).stroke);
  await firstEdge.evaluate((path) => (path as SVGPathElement).style.setProperty("--cui-flow-edge-stroke", "rgb(1, 2, 3)"));
  await expect(firstEdge).toHaveCSS("stroke", "rgb(1, 2, 3)");
  await expect(edges.nth(1)).toHaveCSS("stroke", neighbourStroke);

  await expect(flow.locator('[data-slot="edge"][data-dashed]')).not.toHaveCSS("stroke-dasharray", "none");

  const chip = flow.locator('[data-slot="edge-label-chip"]').first();
  await chip.evaluate((element) => {
    element.textContent = "A branch label long enough to overflow the chip width";
  });
  expect(await chip.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await expect(chip).toHaveCSS("display", "block");
  await expect(chip).toHaveCSS("text-overflow", "ellipsis");

  const selectedStroke = await flow.evaluate((root) => getComputedStyle(root).getPropertyValue("--cui-flow-selected-edge-stroke").trim());
  await flow.locator(".react-flow__edge").nth(3).click({ force: true });
  await expect(edges.nth(3)).toHaveCSS("stroke", selectedStroke);

  const fittedScale = await viewportScale(viewport);
  await flow.getByRole("button", { name: "Zoom in" }).click();
  await expect.poll(() => viewportScale(viewport)).toBeGreaterThan(fittedScale * 1.1);
  await flow.getByRole("button", { name: "Fit view" }).click();
  await expect.poll(() => viewportScale(viewport)).toBeCloseTo(fittedScale, 2);

  const lightNodeBackground = await nodes.first().evaluate((node) => getComputedStyle(node).backgroundColor);
  await page.evaluate(() => document.documentElement.classList.toggle("dark"));
  await expect(nodes.first()).not.toHaveCSS("background-color", lightNodeBackground);

  expect(reactFlowWarnings.filter((warning) => warning.includes("013"))).toEqual([]);
});
