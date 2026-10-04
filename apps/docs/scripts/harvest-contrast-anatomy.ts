import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";
import { contrastAnatomyModule } from "./contrast-anatomy/artifact-module";
import { harvestRoute, type RouteHarvest } from "./contrast-anatomy/harvest";
import type { ContrastAnatomyArtifact, ContrastProbe } from "./contrast-anatomy/model";
import {
  collectAnatomyAttributes,
  collectFillSelectors,
  collectKnobSources,
  collectPaintRules,
  knobHostSelectors,
} from "./contrast-anatomy/paint-map";
import { formatGeneratedTypeScript } from "./format-generated-typescript";
import { publicPayloadPath, publicPayloads } from "./public-payloads";

const checkOnly = process.argv.includes("--check");
const includeMobile = process.argv.includes("--mobile");
const browserExecutable = process.argv.find((argument) => argument.startsWith("--browser-executable="))?.split("=")[1];
const requestedKnobPrefix = process.argv.find((argument) => argument.startsWith("--knob-prefix="))?.split("=")[1];
const artifactPath = publicPayloadPath(publicPayloads.contrastAnatomy);
const modulePath = "app/(features)/theme-accessibility/generated-contrast-anatomy.ts";
const baseUrl = "http://127.0.0.1:3000";

async function documentedRoutes(): Promise<string[]> {
  const sitemap = await fetch(`${baseUrl}/sitemap.xml`).then((response) => response.text());
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
}

async function openSurfaces(page: Page, harvest: () => Promise<unknown>) {
  const triggers = page.locator('main [data-slot="trigger"], main [aria-haspopup]');
  const total = Math.min(await triggers.count(), 6);
  const done = () => true;
  const skipped = () => false;
  for (let index = 0; index < total; index += 1) {
    const trigger = triggers.nth(index);
    if (!(await trigger.hover({ timeout: 1_000 }).then(done, skipped))) continue;
    await page.waitForTimeout(300);
    await harvest();
    if (await trigger.click({ timeout: 1_000 }).then(done, skipped)) {
      await page.waitForTimeout(300);
      await harvest();
      await page.keyboard.press("Escape");
    }
  }
}

async function scrollThrough(page: Page) {
  const step = await page.evaluate(() => window.innerHeight * 0.8);
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let offset = 0; offset < height; offset += step) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), offset);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
}

const rules = collectPaintRules();
const knobSources = collectKnobSources();
const input = {
  rules: rules.map((rule) => ({ ...rule, hosts: knobHostSelectors(Object.values(rule.knobs), knobSources) })),
  anatomyAttributes: collectAnatomyAttributes(),
  fillSelectors: collectFillSelectors(),
};
const probes = new Map<string, { probe: ContrastProbe; order: number }>();
const unreproduced = new Set<string>();
const selected = (probe: Pick<ContrastProbe, "knobs">) =>
  !requestedKnobPrefix || Object.values(probe.knobs).some((knob) => knob.startsWith(requestedKnobPrefix));

const record = (route: string, order: number) => (harvested: RouteHarvest) => {
  for (const selector of harvested.unreproduced) unreproduced.add(selector);
  for (const probe of harvested.probes) {
    if (!selected(probe)) continue;
    const key = JSON.stringify([probe.knobs, probe.anatomy]);
    const known = probes.get(key);
    const rendersText = probe.rendersText || (known?.probe.rendersText ?? false);
    const state = probe.state && (known?.probe.state ?? true);
    const earlier = known && known.order <= order;
    probes.set(
      key,
      earlier
        ? { probe: { ...known.probe, rendersText, state }, order: known.order }
        : { probe: { ...probe, rendersText, state, route }, order },
    );
  }
};

const busy: string[] = [];
const unrendered: string[] = [];

async function visit(page: Page, route: string, order: number): Promise<number> {
  const reached = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 90_000 }).then(
    () => true,
    () => false,
  );
  if (!reached) return 0;
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).then(
    () => undefined,
    () => busy.push(route),
  );
  const collect = record(route, order);
  const harvest = async () => {
    const harvested = await harvestRoute(page, input);
    collect(harvested);
    return harvested.probes.length;
  };
  await scrollThrough(page);
  const rendered = await harvest();
  await openSurfaces(page, harvest);
  return rendered;
}

const WORKERS = 4;
const requestedRoutes = process.argv.slice(2).filter((argument) => argument.startsWith("/"));
const documented = await documentedRoutes();
const routes = requestedRoutes.length > 0 ? requestedRoutes : documented;

const browser = await chromium.launch({ headless: true, executablePath: browserExecutable });
try {
  let cursor = 0;
  const worker = async () => {
    let page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript(() => {
      window.__REACT_GRAB_DISABLED__ = true;
      window.__REACT_SCAN_DISABLED__ = true;
    });
    while (cursor < routes.length) {
      const index = cursor;
      cursor += 1;
      const route = routes[index];
      let rendered = await visit(page, route, index);
      if (rendered === 0) {
        console.log(`${route} rendered nothing — retrying on a fresh page`);
        await page.close();
        page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        await page.addInitScript(() => {
          window.__REACT_GRAB_DISABLED__ = true;
          window.__REACT_SCAN_DISABLED__ = true;
        });
        rendered = await visit(page, route, index);
      }
      if (rendered === 0) unrendered.push(route);
      if (includeMobile) {
        await page.setViewportSize({ width: 390, height: 844 });
        await visit(page, route, index);
        await page.setViewportSize({ width: 1440, height: 900 });
      }
      console.log(`[${index + 1}/${routes.length}] ${route} — ${probes.size} probes`);
    }
    await page.close();
  };
  await Promise.all(Array.from({ length: WORKERS }, worker));
} finally {
  await browser.close();
}

if (unrendered.length > 0) {
  console.error(`${unrendered.length} routes rendered nothing to measure, so this harvest is incomplete:\n  ${unrendered.join("\n  ")}`);
  process.exit(1);
}

const paintedKnobs = new Set(rules.flatMap((rule) => Object.values(rule.knobs)));
const vocabulary = new Set(input.anatomyAttributes);
// a probe is a promise that a documented page still renders this anatomy; drop it when the page or the paint is gone
const stale = (probe: ContrastProbe) =>
  !documented.includes(probe.route) ||
  Object.values(probe.knobs).some((knob) => !paintedKnobs.has(knob)) ||
  probe.anatomy.some((node) => Object.keys(node.attributes).some((name) => !vocabulary.has(name)));

const committedPath = path.join(process.cwd(), artifactPath);
const committed: ContrastProbe[] = existsSync(committedPath) ? JSON.parse(readFileSync(committedPath, "utf8")).probes : [];
for (const probe of committed) {
  const key = JSON.stringify([probe.knobs, probe.anatomy]);
  const refreshed = (selected(probe) && routes.includes(probe.route)) || probes.has(key);
  if (refreshed || (selected(probe) && stale(probe))) continue;
  probes.set(key, { probe, order: Number.MAX_SAFE_INTEGER });
}

const committedOrder = new Map(committed.map((probe, index) => [JSON.stringify(probe), index]));
const sorted = [...probes.values()]
  .map((entry) => entry.probe)
  .sort((left, right) => {
    if (requestedKnobPrefix) {
      const leftOrder = committedOrder.get(JSON.stringify(left)) ?? committed.length;
      const rightOrder = committedOrder.get(JSON.stringify(right)) ?? committed.length;
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    }
    return JSON.stringify(left).localeCompare(JSON.stringify(right));
  });
const harvestedKnobs = new Set(sorted.flatMap((probe) => Object.values(probe.knobs)));
const uncovered = [...new Set(rules.flatMap((rule) => Object.values(rule.knobs)))].filter((knob) => !harvestedKnobs.has(knob)).sort();

const artifact: ContrastAnatomyArtifact = { version: 1, probes: sorted, uncovered };
const targets = [
  { path: artifactPath, content: `${JSON.stringify(artifact, null, 2)}\n` },
  {
    path: modulePath,
    content: formatGeneratedTypeScript(modulePath, contrastAnatomyModule(artifact)),
  },
];

let drift = false;
for (const target of targets) {
  const absolutePath = path.join(process.cwd(), target.path);
  const current = existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
  if (current === target.content) continue;
  drift = true;
  if (checkOnly) {
    console.error(`- ${target.path} is out of date; run \`bun run sync:anatomy\``);
    continue;
  }
  writeFileSync(absolutePath, target.content);
}

if (checkOnly && drift) process.exit(1);
console.log(`${checkOnly ? "Checked" : "Harvested"} ${sorted.length} contrast probes covering ${harvestedKnobs.size} knobs.`);
if (busy.length > 0) console.log(`${busy.length} routes never went idle (harvested anyway): ${busy.join(", ")}`);
if (unreproduced.size > 0) {
  console.log(
    `${unreproduced.size} selectors paint from something outside the contract vocabulary, so no probe describes them:\n  ${[...unreproduced].sort().join("\n  ")}`,
  );
}
if (uncovered.length > 0) console.log(`${uncovered.length} knobs no documented route renders:\n  ${uncovered.join("\n  ")}`);
