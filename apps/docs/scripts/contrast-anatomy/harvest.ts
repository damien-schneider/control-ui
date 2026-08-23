import type { Page } from "@playwright/test";
import type { ContrastProbe } from "./model";
import type { PaintRule } from "./paint-map";

type HarvestRule = Pick<PaintRule, "recipe" | "selector" | "queryable" | "knobs"> & {
  /** Selectors that declare the knobs this rule paints from, directly or through another knob. */
  hosts: string[];
};

type HarvestInput = {
  rules: HarvestRule[];
  anatomyAttributes: string[];
  fillSelectors: string[];
};

export type RouteHarvest = {
  probes: Omit<ContrastProbe, "route">[];
  /** Parts whose knobs the rebuilt chain resolved differently — anatomy the artifact cannot describe. */
  unreproduced: string[];
};

const PAINT_PROPERTY: Record<string, "color" | "backgroundColor" | "borderColor"> = {
  text: "color",
  fill: "backgroundColor",
  boundary: "borderColor",
};

/** One page holds many copies of the same part, and only distinct anatomies are worth a probe. */
const OCCURRENCES_PER_RULE = 60;

/**
 * An anatomy holds what the browser paints behind a part, read off the hit stack under the part's own
 * centre: its ancestors, but also the sibling an indicator slides beneath it, and never a wrapper whose
 * box it is positioned outside of. Membership is then narrowed to the selectors core CSS gives a knob or
 * a fill, so the chain describes structure that holds under any skin rather than this page's colors.
 * Each candidate is rebuilt in isolation and kept only when it resolves the same knob values as the original.
 */
export async function harvestRoute(page: Page, input: HarvestInput): Promise<RouteHarvest> {
  return page.evaluate(
    ({ rules, anatomyAttributes, fillSelectors, paintProperty, occurrencesPerRule }) => {
      const container = document.createElement("div");
      container.style.cssText = "position:fixed;left:-10000px;top:0;width:400px;height:400px";
      document.body.append(container);

      type Node = { attributes: Record<string, string> };

      // Recipes test href for presence only, so every URL collapses to one anatomy instead of one per link.
      const attributesOf = (element: Element) => {
        const attributes: Record<string, string> = {};
        for (const name of anatomyAttributes) {
          const value = element.getAttribute(name);
          if (value !== null) attributes[name] = name === "href" ? "#" : value;
        }
        return attributes;
      };

      const matchesAny = (element: Element, selectors: string[]) => selectors.some((selector) => element.matches(selector));

      /** Hit testing reads the viewport, so parts are measured a screenful at a time. */
      const bandOf = (element: Element) => Math.floor((element.getBoundingClientRect().top + window.scrollY) / window.innerHeight);

      /** What the browser paints under the part, back to front, with whatever covers it dropped. */
      const stackBehind = (element: Element): Element[] | null => {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return null;
        const x = rect.left + rect.width / 2;
        const y = Math.min(Math.max(rect.top + rect.height / 2, 1), window.innerHeight - 1);
        if (x < 0 || x > window.innerWidth || rect.bottom < 0 || rect.top > window.innerHeight) return null;
        const stack = document.elementsFromPoint(x, y);
        const self = stack.indexOf(element);
        if (self < 0) return null;
        return stack.slice(self + 1).reverse();
      };

      const anatomyOf = (element: Element, hosts: string[]): Node[] | null => {
        const behind = stackBehind(element);
        if (!behind) return null;
        const backdrops = behind.filter((node) => matchesAny(node, hosts) || matchesAny(node, fillSelectors));
        return [...backdrops, element].map((node) => ({ attributes: attributesOf(node) }));
      };

      const rebuild = (anatomy: Node[]) => {
        container.replaceChildren();
        let host: HTMLElement = container;
        let leaf: HTMLElement = container;
        for (const node of anatomy) {
          const element = document.createElement("div");
          for (const [name, value] of Object.entries(node.attributes)) element.setAttribute(name, value);
          host.append(element);
          host = element;
          leaf = element;
        }
        return leaf;
      };

      /** What the anatomy must reproduce: the knob values the part resolves, not the pixel a consumer may paint over. */
      const knobValues = (element: Element, knobs: string[]) => {
        const style = getComputedStyle(element);
        return knobs.map((knob) => style.getPropertyValue(knob).trim());
      };

      /** A later rule or a consumer utility can win a role, and then this rule's knob describes no pixel here. */
      const paintsFromKnobs = (element: Element, knobs: [string, string][]) => {
        const style = getComputedStyle(element);
        return knobs.every(([role, knob]) => Reflect.get(style, Reflect.get(paintProperty, role)) === style.getPropertyValue(knob).trim());
      };

      const probes = new Map<string, Omit<ContrastProbe, "route">>();
      const unreproduced = new Set<string>();

      /** Glyphs decide the ratio a part owes: text answers to 4.5:1, a graphic to 3:1. */
      const remember = (key: string, probe: Omit<ContrastProbe, "route">) => {
        const known = probes.get(key);
        if (!known) return probes.set(key, probe);
        return probes.set(key, { ...known, rendersText: known.rendersText || probe.rendersText, state: known.state && probe.state });
      };

      type Candidate = { rule: (typeof rules)[number]; element: Element; rendered: string[] };

      const candidatesOf = (rule: (typeof rules)[number]): Candidate[] => {
        const knobs = Object.values(rule.knobs);
        const roles = Object.entries(rule.knobs);
        // A state rule paints only under an interaction the harvest cannot hold, so its knobs stand unchecked.
        const interactive = rule.selector !== rule.queryable;
        const candidates: Candidate[] = [];
        for (const element of [...document.querySelectorAll(rule.queryable)].slice(0, occurrencesPerRule)) {
          const rendered = knobValues(element, knobs);
          if (rendered.some((value) => value.length === 0)) continue;
          if (!interactive && !paintsFromKnobs(element, roles)) continue;
          candidates.push({ rule, element, rendered });
        }
        return candidates;
      };

      const measure = ({ rule, element, rendered }: Candidate) => {
        const anatomy = anatomyOf(element, rule.hosts);
        if (!anatomy) return;
        if (knobValues(rebuild(anatomy), Object.values(rule.knobs)).join("|") !== rendered.join("|")) {
          unreproduced.add(rule.queryable);
          return;
        }
        remember(JSON.stringify([rule.knobs, anatomy]), {
          knobs: rule.knobs,
          anatomy,
          recipe: rule.recipe,
          rendersText: (element.textContent ?? "").trim().length > 0,
          state: rule.selector !== rule.queryable,
        });
      };

      const onScreen = (element: Element) => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      };

      // A popup rides the viewport rather than the page, so whatever is already on screen is measured before scrolling moves it.
      const bands = new Map<number, Candidate[]>();
      for (const rule of rules) {
        for (const candidate of candidatesOf(rule)) {
          if (onScreen(candidate.element)) measure(candidate);
          else {
            const band = bandOf(candidate.element);
            bands.set(band, [...(bands.get(band) ?? []), candidate]);
          }
        }
      }

      const resting = window.scrollY;
      for (const [band, candidates] of [...bands.entries()].sort(([left], [right]) => left - right)) {
        window.scrollTo({ top: band * window.innerHeight, behavior: "instant" });
        for (const candidate of candidates) measure(candidate);
      }
      window.scrollTo({ top: resting, behavior: "instant" });

      container.remove();
      return { probes: [...probes.values()], unreproduced: [...unreproduced] };
    },
    { ...input, paintProperty: PAINT_PROPERTY, occurrencesPerRule: OCCURRENCES_PER_RULE },
  );
}
