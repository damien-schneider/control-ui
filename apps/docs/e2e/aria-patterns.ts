import type { Locator, Page } from "@playwright/test";

/**
 * Checks a rendered widget against its WAI-ARIA Authoring Practices pattern: roles, accessible names, states,
 * references between parts, and the keyboard interactions, pressed with real keys in the browser.
 *
 * Returns every problem found. Problems marked `policy` are stricter than the APG text, where it calls the behavior
 * optional; the rest are APG requirements. The check moves focus and changes state; it restores what it cheaply can,
 * so run it on a page that doesn't depend on the widget's state afterwards.
 */
export type AriaPattern =
  | "accordion"
  | "alertdialog"
  | "checkbox"
  | "combobox"
  | "dialog"
  | "disclosure"
  | "menu"
  | "menubar"
  | "radio-group"
  | "select"
  | "slider"
  | "switch"
  | "tabs"
  | "toolbar"
  | "tree";

export type CheckPatternOptions = {
  /** Opens a dialog or alert dialog. Required for those patterns; the check presses Enter on it. */
  trigger?: Locator;
};

export type PatternProblem = { subject: string; message: string; policy: boolean };

export async function checkPattern(root: Locator, pattern: AriaPattern, options: CheckPatternOptions = {}) {
  const check = new Check(root.page());
  await check.install();
  await checks[pattern](check, root, options);
  await check.blur();
  return check.problems;
}

type Info = {
  key: string;
  tag: string;
  role: string;
  name: string;
  visible: boolean;
  disabled: boolean;
  tabbable: boolean;
  /** Disabled items that keep focus (`aria-disabled` without native `disabled`) still take part in arrow-key navigation. */
  focusable: boolean;
  value: string | null;
  checked: string | null;
  dir: string;
  attrs: Record<string, string | null>;
};

const INSPECTED_ATTRIBUTES = [
  "aria-activedescendant",
  "aria-controls",
  "aria-describedby",
  "aria-expanded",
  "aria-haspopup",
  "aria-labelledby",
  "aria-modal",
  "aria-orientation",
  "aria-selected",
  "aria-readonly",
  "aria-valuemax",
  "aria-valuemin",
  "aria-valuenow",
  "id",
  "max",
  "min",
];

type Probe = {
  inspect(element: Element): Info;
  query(scope: Element, selector: string): Info[];
  byId(id: string): Info | null;
  active(): Info | null;
};

declare global {
  interface Window {
    __ariaPatternProbe: Probe;
  }
}

function installProbe(attributes: string[]) {
  if (window.__ariaPatternProbe) return;
  let nextKey = 0;
  const implicitRoles: Record<string, string> = {
    a: "link",
    button: "button",
    dialog: "dialog",
    h1: "heading",
    h2: "heading",
    h3: "heading",
    h4: "heading",
    h5: "heading",
    h6: "heading",
  };
  const inputRoles: Record<string, string> = { checkbox: "checkbox", radio: "radio", range: "slider" };
  const namedFromContent: Record<string, true> = {
    button: true,
    checkbox: true,
    heading: true,
    link: true,
    menuitem: true,
    menuitemcheckbox: true,
    menuitemradio: true,
    option: true,
    radio: true,
    switch: true,
    tab: true,
    treeitem: true,
  };
  const text = (element: Element) => ((element as HTMLElement).innerText ?? element.textContent ?? "").replace(/\s+/g, " ").trim();
  const roleOf = (element: Element) => {
    const explicit = element.getAttribute("role")?.split(/\s+/)[0];
    if (explicit) return explicit;
    if (element instanceof HTMLInputElement) return inputRoles[element.type] ?? "textbox";
    return implicitRoles[element.tagName.toLowerCase()] ?? "";
  };
  const textOfIds = (ids: string | null) =>
    (ids ?? "")
      .split(/\s+/)
      .map((id) => (id ? document.getElementById(id) : null))
      .filter((node): node is HTMLElement => node !== null)
      .map(text)
      .join(" ")
      .trim();
  const nameOf = (element: Element, role: string) => {
    const labelledBy = textOfIds(element.getAttribute("aria-labelledby"));
    if (labelledBy) return labelledBy;
    const label = element.getAttribute("aria-label")?.trim();
    if (label) return label;
    if (element instanceof HTMLInputElement && element.labels?.length) return [...element.labels].map(text).join(" ").trim();
    const content = namedFromContent[role] ? text(element) : "";
    return content || element.getAttribute("title")?.trim() || element.getAttribute("placeholder")?.trim() || "";
  };
  const keyOf = (element: Element) => {
    let key = element.getAttribute("data-aria-pattern-key");
    if (!key) {
      key = String(nextKey++);
      element.setAttribute("data-aria-pattern-key", key);
    }
    return key;
  };
  const inspect = (element: Element): Info => {
    const role = roleOf(element);
    const html = element as HTMLElement;
    const nativelyDisabled = (element as HTMLButtonElement).disabled === true || element.closest("fieldset:disabled") !== null;
    return {
      key: keyOf(element),
      tag: element.tagName.toLowerCase(),
      role,
      name: nameOf(element, role),
      visible: html.checkVisibility?.({ visibilityProperty: true }) ?? html.offsetParent !== null,
      disabled: nativelyDisabled || element.getAttribute("aria-disabled") === "true",
      tabbable: html.tabIndex >= 0 && !nativelyDisabled,
      focusable: !nativelyDisabled,
      value: element.getAttribute("aria-valuenow") ?? (element instanceof HTMLInputElement ? element.value : null),
      checked: element.getAttribute("aria-checked") ?? (element instanceof HTMLInputElement ? String(element.checked) : null),
      dir: getComputedStyle(element).direction,
      attrs: Object.fromEntries(attributes.map((attribute) => [attribute, element.getAttribute(attribute)])),
    };
  };
  window.__ariaPatternProbe = {
    inspect,
    query: (scope, selector) => {
      const matches = [...scope.querySelectorAll(selector)];
      if (scope.matches(selector)) matches.unshift(scope);
      return matches.map(inspect);
    },
    byId: (id) => {
      const element = document.getElementById(id);
      return element ? inspect(element) : null;
    },
    active: () => {
      let element = document.activeElement;
      while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement;
      return element && element !== document.body ? inspect(element) : null;
    },
  };
}

class Check {
  readonly problems: PatternProblem[] = [];

  constructor(readonly page: Page) {}

  install() {
    return this.page.evaluate(installProbe, INSPECTED_ATTRIBUTES);
  }

  fail(subject: Info | string, message: string, { policy = false } = {}) {
    const label = typeof subject === "string" ? subject : describe(subject);
    this.problems.push({ subject: label, message, policy });
  }

  locate(info: Info) {
    return this.page.locator(`[data-aria-pattern-key="${info.key}"]`);
  }

  /** Visible matches inside `scope`, in DOM order; `scope` itself counts when it matches. */
  query(scope: Locator, selector: string) {
    return scope.evaluate((element, target) => window.__ariaPatternProbe.query(element, target), selector).then(visibleOnly);
  }

  /** Current state of `info`'s element. */
  inspect(info: Info) {
    return this.locate(info).evaluate((element) => window.__ariaPatternProbe.inspect(element));
  }

  byId(id: string | null) {
    if (!id) return Promise.resolve(null);
    return this.page.evaluate((target) => window.__ariaPatternProbe.byId(target), id);
  }

  active() {
    return this.page.evaluate(() => window.__ariaPatternProbe.active());
  }

  /** Polls `read` until `accept` holds or the timeout passes, and returns the last value either way. */
  async settle<T>(read: () => Promise<T>, accept: (value: T) => boolean, timeout = 1_000): Promise<T> {
    const deadline = Date.now() + timeout;
    let value = await read();
    while (!accept(value) && Date.now() < deadline) {
      await this.page.waitForTimeout(25);
      value = await read();
    }
    return value;
  }

  async press(key: string) {
    await this.page.keyboard.press(key);
  }

  async focus(info: Info) {
    await this.locate(info).focus();
    await this.settle(
      () => this.active(),
      (active) => active?.key === info.key,
    );
  }

  /** Presses `key` and expects focus to land on one of `expected`; returns where it landed. */
  async expectFocusAfter(key: string, expected: Info[], context: string, { policy = false } = {}) {
    await this.press(key);
    const keys = new Set(expected.map((info) => info.key));
    const active = await this.settle(
      () => this.active(),
      (current) => current !== null && keys.has(current.key),
    );
    if (!active || !keys.has(active.key)) {
      this.fail(context, `${key} should move focus to ${expected.map(describe).join(" or ")}, focus is on ${describeFocus(active)}`, {
        policy,
      });
    }
    return active;
  }

  /** Expects focus to settle on `expected` after `action`; with no `expected` there is nothing to check. */
  async expectFocusOn(subject: Info | string, expected: Info | undefined, action: string) {
    if (!expected) return true;
    const active = await this.settle(
      () => this.active(),
      (current) => current?.key === expected.key,
    );
    if (active?.key === expected.key) return true;
    this.fail(subject, `${action} should focus ${describe(expected)}, focus is on ${describeFocus(active)}`);
    return false;
  }

  blur() {
    return this.page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
      for (const element of document.querySelectorAll("[data-aria-pattern-key]")) element.removeAttribute("data-aria-pattern-key");
    });
  }
}

function visibleOnly(infos: Info[]) {
  return infos.filter((info) => info.visible);
}

function describe(info: Info) {
  return `${info.role || info.tag}${info.name ? ` "${info.name.slice(0, 40)}"` : ""}`;
}

function describeFocus(active: Info | null) {
  return active ? describe(active) : "the page";
}

const isTrue = (value: string | null) => value === "true";

function nextKeys(info: Info, orientation: "horizontal" | "vertical") {
  if (orientation === "vertical") return { next: "ArrowDown", previous: "ArrowUp" };
  return info.dir === "rtl" ? { next: "ArrowLeft", previous: "ArrowRight" } : { next: "ArrowRight", previous: "ArrowLeft" };
}

function orientationOf(info: Info, fallback: "horizontal" | "vertical") {
  const orientation = info.attrs["aria-orientation"];
  return orientation === "horizontal" || orientation === "vertical" ? orientation : fallback;
}

function requireName(check: Check, info: Info, { policy = false } = {}) {
  if (!info.name) check.fail(info, "has no accessible name", { policy });
}

/** Items arrow keys stop on: enabled ones plus disabled ones that stay focusable, which APG recommends for menus and tabs. */
const focusStops = (items: Info[]) => items.filter((item) => item.focusable);

/** Moves through `items` with `next` from `start` and expects each step, wrapping at the end when `wrap` is set. */
async function walk(check: Check, items: Info[], start: number, next: string, context: string, { wrap = true, policy = false } = {}) {
  const steps = wrap ? items.length : items.length - 1 - start;
  let index = start;
  for (let step = 0; step < steps; step += 1) {
    const expected = (index + 1) % items.length;
    const landed = await check.expectFocusAfter(next, [items[expected]], context, { policy });
    if (landed?.key !== items[expected].key) return false;
    index = expected;
  }
  return true;
}

async function homeEnd(check: Check, items: Info[], context: string, { policy }: { policy: boolean }) {
  if (items.length < 2) return;
  await check.expectFocusAfter("End", [items[items.length - 1]], context, { policy });
  await check.expectFocusAfter("Home", [items[0]], context, { policy });
}

/** Visible descendants of `owner` matching `selector`, run in the page, that `owner` directly owns. */
function descendants(check: Check, owner: Info, selector: string, ownerSelector: string | null) {
  return check
    .locate(owner)
    .evaluate(
      (element, args) =>
        [...element.querySelectorAll(args.selector)]
          .filter((child) => args.ownerSelector === null || child.parentElement?.closest(args.ownerSelector) === element)
          .map((child) => window.__ariaPatternProbe.inspect(child)),
      { selector, ownerSelector },
    )
    .then(visibleOnly);
}

/** Elements of `role` whose closest `ownerSelector` ancestor is `owner`, so nested widgets don't leak into their parents. */
function owned(check: Check, owner: Info, role: string, ownerSelector: string) {
  return descendants(check, owner, `[role="${role}"]`, ownerSelector);
}

async function popupFor(check: Check, owner: Info, role: string) {
  const controlled = await check.byId((await check.inspect(owner)).attrs["aria-controls"]);
  if (controlled?.visible) return controlled;
  const popups = await check.query(check.page.locator("body"), `[role="${role}"]`);
  return popups.at(-1) ?? null;
}

/** Focuses `owner`, presses `key` (or nothing), and waits for the popup of `role` it opens. */
async function openPopup(check: Check, owner: Info, key: string | null, role: string) {
  await check.focus(owner);
  if (key) await check.press(key);
  return check.settle(
    () => popupFor(check, owner, role),
    (popup) => popup !== null,
  );
}

/** Escape closes `popup`, returns focus to `owner`, and resets its aria-expanded. */
async function expectEscapeCloses(check: Check, owner: Info, popup: Info, context: string) {
  await check.expectFocusAfter("Escape", [owner], `${context} (Escape)`);
  const hidden = await check.settle(
    () =>
      check
        .locate(popup)
        .evaluate((element) => !element.isConnected || !(element as HTMLElement).checkVisibility())
        .catch(() => true),
    Boolean,
    1_500,
  );
  if (!hidden) check.fail(context, "Escape doesn't close it");
  const expanded = await check.inspect(owner).then((info) => info.attrs["aria-expanded"]);
  if (expanded === "true") check.fail(owner, `keeps aria-expanded="true" after ${context} closes`);
}

const checks: Record<AriaPattern, (check: Check, root: Locator, options: CheckPatternOptions) => Promise<void>> = {
  accordion: (check, root) => checkExpandable(check, root, "accordion"),
  alertdialog: (check, _root, options) => checkDialog(check, options, "alertdialog"),
  checkbox: (check, root) => checkToggle(check, root, "checkbox"),
  combobox: checkCombobox,
  dialog: (check, _root, options) => checkDialog(check, options, "dialog"),
  disclosure: (check, root) => checkExpandable(check, root, "disclosure"),
  menu: checkMenuButton,
  menubar: checkMenubar,
  "radio-group": checkRadioGroup,
  select: checkSelect,
  slider: checkSlider,
  switch: (check, root) => checkToggle(check, root, "switch"),
  tabs: checkTabs,
  toolbar: checkToolbar,
  tree: checkTree,
};

/** Queries the pattern's containers in `root` and checks each one. */
async function forEachContainer(check: Check, root: Locator, selector: string, label: string, run: (info: Info) => Promise<void>) {
  const containers = await check.query(root, selector);
  if (containers.length === 0) check.fail(label, `no visible element matches ${selector}`);
  for (const container of containers) await run(container);
}

function checkTabs(check: Check, root: Locator) {
  return forEachContainer(check, root, '[role="tablist"]', "tabs", (list) => checkTabList(check, list));
}

async function checkTabList(check: Check, list: Info) {
  requireName(check, list, { policy: true });
  const strays = await descendants(
    check,
    list,
    ':is(button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])):not([aria-hidden="true"], [aria-hidden="true"] *)',
    '[role="tablist"]',
  ).then((infos) => infos.filter((info) => info.role !== "tab"));
  for (const stray of strays) check.fail(stray, `sits inside tablist ${describe(list)} but isn't a tab; a tablist may only own tabs`);
  const tabs = await owned(check, list, "tab", '[role="tablist"]');
  if (tabs.length === 0) {
    check.fail(list, "owns no tabs");
    return;
  }
  for (const tab of tabs) requireName(check, tab);
  const selected = tabs.filter((tab) => isTrue(tab.attrs["aria-selected"]));
  if (selected.length !== 1) check.fail(list, `has ${selected.length} tabs with aria-selected="true", expected 1`);
  const tabbable = tabs.filter((tab) => tab.tabbable);
  if (tabbable.length !== 1) check.fail(list, `has ${tabbable.length} tabs in the tab sequence, expected 1`);
  if (selected[0]) await checkTabPanel(check, selected[0]);
  await checkTabKeys(check, list, focusStops(tabs), selected[0] ?? tabs[0]);
}

async function checkTabPanel(check: Check, tab: Info) {
  const panel = await check.byId(tab.attrs["aria-controls"]);
  if (!panel) {
    check.fail(tab, "is selected but aria-controls doesn't reference a rendered tabpanel");
    return;
  }
  if (panel.role !== "tabpanel") check.fail(panel, `is controlled by ${describe(tab)} but has role "${panel.role}"`);
  if (!panel.name) check.fail(panel, "has no accessible name; label it with aria-labelledby pointing at its tab");
}

async function checkTabKeys(check: Check, list: Info, stops: Info[], current: Info) {
  if (stops.length < 2) return;
  const { next, previous } = nextKeys(list, orientationOf(list, "horizontal"));
  const context = `tablist ${describe(list)}`;
  const start = Math.max(
    0,
    stops.findIndex((tab) => tab.key === current.key),
  );
  await check.focus(current);
  if (await walk(check, stops, start, next, context)) {
    await check.expectFocusAfter(previous, [stops[(start - 1 + stops.length) % stops.length]], context);
  }
  await check.focus(stops[0]);
  await homeEnd(check, stops, context, { policy: true });
  await check.locate(current).click();
}

function checkRadioGroup(check: Check, root: Locator) {
  return forEachContainer(check, root, '[role="radiogroup"]', "radio-group", (group) => checkRadios(check, group));
}

async function checkRadios(check: Check, group: Info) {
  requireName(check, group);
  const radios = await owned(check, group, "radio", '[role="radiogroup"]');
  if (radios.length === 0) {
    check.fail(group, "owns no elements with role radio");
    return;
  }
  for (const radio of radios) requireName(check, radio);
  for (const radio of radios.filter((item) => item.checked !== "true" && item.checked !== "false")) {
    check.fail(radio, `aria-checked is "${radio.checked}", expected true or false`);
  }
  const checked = radios.filter((radio) => isTrue(radio.checked));
  if (checked.length > 1) check.fail(group, `has ${checked.length} checked radios`);
  const enabled = radios.filter((radio) => !radio.disabled);
  const expectedStop = checked[0] && !checked[0].disabled ? checked[0] : enabled[0];
  const stops = radios.filter((radio) => radio.tabbable);
  if (stops.length !== 1 || (expectedStop && stops[0].key !== expectedStop.key)) {
    check.fail(
      group,
      `tab sequence holds ${stops.map(describe).join(", ") || "no radio"}, expected only ${expectedStop ? describe(expectedStop) : "one radio"}`,
    );
  }
  if (enabled.length < 2 || !expectedStop) return;
  await checkRadioKeys(check, group, enabled, expectedStop);
  if (checked[0]) await check.locate(checked[0]).click();
}

async function checkRadioKeys(check: Check, group: Info, enabled: Info[], start: Info) {
  const context = `radiogroup ${describe(group)}`;
  const ltr = group.dir !== "rtl";
  let index = enabled.findIndex((radio) => radio.key === start.key);
  await check.focus(start);
  for (const key of ["ArrowDown", ltr ? "ArrowRight" : "ArrowLeft"]) {
    index = (index + 1) % enabled.length;
    const landed = await check.expectFocusAfter(key, [enabled[index]], context);
    if (landed && !isTrue((await check.inspect(landed)).checked)) check.fail(landed, `${key} focused it without checking it`);
  }
  for (const key of ["ArrowUp", ltr ? "ArrowLeft" : "ArrowRight"]) {
    index = (index - 1 + enabled.length) % enabled.length;
    await check.expectFocusAfter(key, [enabled[index]], context);
  }
  await check.focus(enabled[0]);
  await check.expectFocusAfter("ArrowUp", [enabled[enabled.length - 1]], `${context} (wrapping)`);
}

function checkToggle(check: Check, root: Locator, role: "checkbox" | "switch") {
  const selector = role === "checkbox" ? '[role="checkbox"], input[type="checkbox"]:not([tabindex="-1"])' : '[role="switch"]';
  const allowed = role === "checkbox" ? ["true", "false", "mixed"] : ["true", "false"];
  return forEachContainer(check, root, selector, role, async (toggle) => {
    requireName(check, toggle);
    if (!allowed.includes(toggle.checked ?? "")) check.fail(toggle, `checked state is "${toggle.checked}", expected ${allowed.join(", ")}`);
    if (toggle.disabled || isTrue(toggle.attrs["aria-readonly"])) return;
    if (!toggle.tabbable) check.fail(toggle, "is enabled but not in the tab sequence");
    await check.focus(toggle);
    await check.press("Space");
    const after = await check.settle(
      () => check.inspect(toggle).then((info) => info.checked),
      (value) => value !== toggle.checked,
    );
    if (after === toggle.checked) check.fail(toggle, "Space doesn't change its checked state");
    else await check.press("Space");
  });
}

const sliderValue = (check: Check, slider: Info) => check.inspect(slider).then((info) => Number(info.value));

function checkSlider(check: Check, root: Locator) {
  return forEachContainer(check, root, '[role="slider"], input[type="range"]', "slider", (slider) => checkSliderThumb(check, slider));
}

async function checkSliderThumb(check: Check, slider: Info) {
  requireName(check, slider);
  const min = Number(slider.attrs["aria-valuemin"] ?? slider.attrs.min ?? 0);
  const max = Number(slider.attrs["aria-valuemax"] ?? slider.attrs.max ?? 100);
  const value = Number(slider.value);
  if (Number.isNaN(value) || value < min || value > max) check.fail(slider, `value ${slider.value} is outside ${min}–${max}`);
  if (slider.disabled) return;
  // Thumbs of one range slider share a group and stop at each other's value.
  const others = await check.locate(slider).evaluate((element) => {
    const group = element.closest('[role="group"]');
    if (!group) return [];
    return [...group.querySelectorAll('[role="slider"], input[type="range"]')]
      .filter((other) => other !== element)
      .map((other) => Number(window.__ariaPatternProbe.inspect(other).value));
  });
  await check.focus(slider);
  await checkSliderArrows(check, slider, new Set([min, max, ...others]));
  for (const [key, target] of [
    ["End", max],
    ["Home", min],
  ] as const) {
    await check.press(key);
    const after = await check.settle(
      () => sliderValue(check, slider),
      (current) => current === target || others.includes(current),
    );
    if (after !== target && !others.includes(after)) check.fail(slider, `${key} set the value to ${after}, expected ${target}`);
  }
}

async function checkSliderArrows(check: Check, slider: Info, limits: Set<number>) {
  for (const [key, direction] of [
    ["ArrowRight", 1],
    ["ArrowLeft", -1],
    ["ArrowUp", 1],
    ["ArrowDown", -1],
  ] as const) {
    const before = await sliderValue(check, slider);
    await check.press(key);
    const after = await check.settle(
      () => sliderValue(check, slider),
      (current) => current !== before,
    );
    const blocked = limits.has(before) && after === before;
    if (!blocked && Math.sign(after - before) !== direction) check.fail(slider, `${key} moved the value from ${before} to ${after}`);
  }
}

function checkExpandable(check: Check, root: Locator, pattern: "accordion" | "disclosure") {
  return forEachContainer(
    check,
    root,
    "button[aria-expanded]:not([aria-haspopup]), [role='button'][aria-expanded]:not([aria-haspopup])",
    pattern,
    (trigger) => checkExpandableTrigger(check, trigger, pattern),
  );
}

async function checkExpandableTrigger(check: Check, trigger: Info, pattern: "accordion" | "disclosure") {
  requireName(check, trigger);
  if (pattern === "accordion") {
    const inHeading = await check.locate(trigger).evaluate((element) => {
      const parent = element.parentElement;
      return parent !== null && (/^H[1-6]$/.test(parent.tagName) || parent.getAttribute("role") === "heading");
    });
    if (!inHeading) check.fail(trigger, "isn't wrapped in an element with role heading");
    if (isTrue(trigger.attrs["aria-expanded"]) && !(await check.byId(trigger.attrs["aria-controls"]))) {
      check.fail(trigger, "is expanded but aria-controls doesn't reference its rendered panel");
    }
  }
  if (trigger.disabled) return;
  await check.focus(trigger);
  for (const key of ["Enter", "Space"]) {
    const before = (await check.inspect(trigger)).attrs["aria-expanded"];
    await check.press(key);
    const after = await check.settle(
      () => check.inspect(trigger).then((info) => info.attrs["aria-expanded"]),
      (value) => value !== before,
    );
    if (after === before) check.fail(trigger, `${key} doesn't toggle aria-expanded`);
  }
}

const isTextField = (info: Info) => ["input", "textarea", "select"].includes(info.tag);

async function checkToolbar(check: Check, root: Locator) {
  const onPage = await check.page.locator('[role="toolbar"]').count();
  await forEachContainer(check, root, '[role="toolbar"]', "toolbar", (toolbar) =>
    checkToolbarControls(check, toolbar, { nameIsPolicy: onPage === 1 }),
  );
}

async function checkToolbarControls(check: Check, toolbar: Info, { nameIsPolicy }: { nameIsPolicy: boolean }) {
  requireName(check, toolbar, { policy: nameIsPolicy });
  const items = await descendants(
    check,
    toolbar,
    "button, a[href], input:not([type='hidden']):not([id$='-hidden-input']), select, textarea, [role='button'], [role='checkbox'], [role='radio'], [role='switch'], [role='menuitem']",
    '[role="toolbar"]',
  );
  const tabbable = items.filter((item) => item.tabbable);
  if (tabbable.length !== 1)
    check.fail(toolbar, `has ${tabbable.length} controls in the tab sequence, expected 1 (${tabbable.map(describe).join(", ")})`);
  // Arrow keys inside a text field move the caret, so navigation ends at the first one.
  const stops = focusStops(items);
  const firstTextField = stops.findIndex(isTextField);
  const navigable = firstTextField === -1 ? stops : stops.slice(0, firstTextField + 1);
  if (navigable.length < 2) return;
  const { next, previous } = nextKeys(toolbar, orientationOf(toolbar, "horizontal"));
  const context = `toolbar ${describe(toolbar)}`;
  await check.focus(navigable[0]);
  if (await walk(check, navigable, 0, next, context, { wrap: false })) {
    await check.expectFocusAfter(previous, [navigable[navigable.length - 2]], context);
  }
  await check.focus(navigable[0]);
  if (firstTextField === -1) await homeEnd(check, navigable, context, { policy: true });
}

function menuItems(check: Check, menu: Info) {
  return descendants(check, menu, '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]', '[role="menu"]');
}

async function checkMenu(check: Check, menu: Info, owner: Info, context: string) {
  requireName(check, menu);
  const items = await menuItems(check, menu);
  if (items.length === 0) {
    check.fail(menu, "owns no menu items");
    return;
  }
  for (const item of items) {
    requireName(check, item);
    if (item.role !== "menuitem" && item.checked !== "true" && item.checked !== "false")
      check.fail(item, `aria-checked is "${item.checked}"`);
  }
  const stops = focusStops(items);
  if (await check.expectFocusOn(context, stops[0], "opening the menu")) await checkMenuKeys(check, stops, context);
  const submenuTrigger = stops.find((item) => item.attrs["aria-haspopup"]);
  if (submenuTrigger) await checkSubmenu(check, menu, owner, submenuTrigger);
}

async function checkMenuKeys(check: Check, stops: Info[], context: string) {
  if (stops.length < 2) return;
  await walk(check, stops, 0, "ArrowDown", context, { wrap: false });
  await check.expectFocusAfter("ArrowUp", [stops[stops.length - 2]], context);
  await homeEnd(check, stops, context, { policy: true });
  const current = await check.active();
  const currentInitial = current?.name[0]?.toLowerCase();
  const target = stops.find((item) => item.key !== current?.key && item.name && item.name[0].toLowerCase() !== currentInitial);
  if (!target) return;
  const letter = target.name[0].toLowerCase();
  const candidates = stops.filter((item) => item.name[0]?.toLowerCase() === letter);
  await check.expectFocusAfter(letter, candidates, `${context} (typeahead "${letter}")`);
}

async function checkSubmenu(check: Check, menu: Info, owner: Info, trigger: Info) {
  const { next, previous } = nextKeys(owner, "horizontal");
  await check.focus(trigger);
  await check.press(next);
  const submenu = await check.settle(
    () => popupFor(check, trigger, "menu"),
    (popup) => popup !== null && popup.key !== menu.key,
  );
  if (!submenu || submenu.key === menu.key) {
    check.fail(trigger, `${next} doesn't open its submenu`);
    return;
  }
  await check.expectFocusOn(trigger, focusStops(await menuItems(check, submenu))[0], `${next} into its submenu`);
  await check.expectFocusAfter(previous, [trigger], `submenu of ${describe(trigger)}`);
}

async function checkMenuButton(check: Check, root: Locator) {
  const triggers = (await check.query(root, '[aria-haspopup]:not([aria-haspopup="false"])')).filter(
    (info) => info.role !== "menuitem" && !info.disabled,
  );
  if (triggers.length === 0) check.fail("menu", "no visible menu button");
  for (const trigger of triggers) await checkMenuTrigger(check, trigger);
}

async function checkMenuTrigger(check: Check, trigger: Info) {
  requireName(check, trigger);
  if (!["true", "menu"].includes(trigger.attrs["aria-haspopup"] ?? ""))
    check.fail(trigger, `aria-haspopup is "${trigger.attrs["aria-haspopup"]}", expected menu`);
  if (isTrue(trigger.attrs["aria-expanded"])) check.fail(trigger, 'has aria-expanded="true" while its menu is closed');
  const context = `menu of ${describe(trigger)}`;
  for (const key of ["Enter", "Space"]) {
    const menu = await openPopup(check, trigger, key, "menu");
    if (!menu) {
      check.fail(trigger, `${key} doesn't open a menu`);
      continue;
    }
    if (!isTrue((await check.inspect(trigger)).attrs["aria-expanded"]))
      check.fail(trigger, 'doesn\'t set aria-expanded="true" while its menu is open');
    if (key === "Enter") await checkMenu(check, menu, trigger, context);
    await expectEscapeCloses(check, trigger, menu, context);
  }
}

function checkMenubar(check: Check, root: Locator) {
  return forEachContainer(check, root, '[role="menubar"]', "menubar", (bar) => checkMenubarItems(check, bar));
}

async function checkMenubarItems(check: Check, bar: Info) {
  requireName(check, bar, { policy: true });
  const items = focusStops(await owned(check, bar, "menuitem", '[role="menubar"]'));
  const tabbable = items.filter((item) => item.tabbable);
  if (tabbable.length !== 1) check.fail(bar, `has ${tabbable.length} items in the tab sequence, expected 1`);
  if (items.length === 0) return;
  const { next, previous } = nextKeys(bar, orientationOf(bar, "horizontal"));
  const context = `menubar ${describe(bar)}`;
  await check.focus(items[0]);
  if (await walk(check, items, 0, next, context)) await check.expectFocusAfter(previous, [items[items.length - 1]], context);
  await check.focus(items[0]);
  await homeEnd(check, items, context, { policy: true });
  const withPopup = items.find((item) => item.attrs["aria-haspopup"]);
  if (withPopup) await checkMenubarMenu(check, withPopup);
}

async function checkMenubarMenu(check: Check, trigger: Info) {
  const context = `menu of ${describe(trigger)}`;
  for (const key of ["Enter", "ArrowDown"]) {
    const menu = await openPopup(check, trigger, key, "menu");
    if (!menu) {
      check.fail(trigger, `${key} doesn't open its menu`);
      continue;
    }
    if (key === "Enter") await checkMenu(check, menu, trigger, context);
    else await check.expectFocusOn(trigger, focusStops(await menuItems(check, menu))[0], key);
    await expectEscapeCloses(check, trigger, menu, context);
  }
}

type ListboxState = { active: Info | null; domFocus: boolean };

async function listboxState(check: Check, combobox: Info): Promise<ListboxState> {
  const active = await check.active();
  if (active?.role === "option") return { active, domFocus: true };
  const descendant = await check.byId((await check.inspect(combobox)).attrs["aria-activedescendant"]);
  return { active: descendant?.role === "option" ? descendant : null, domFocus: false };
}

function listboxOptions(check: Check, listbox: Info) {
  return descendants(check, listbox, '[role="option"]', null);
}

/** `editable` comboboxes keep DOM focus in their input; select-only ones may move it to the options. */
async function checkListboxKeys(check: Check, combobox: Info, listbox: Info, context: string, { editable }: { editable: boolean }) {
  // The listbox may be named a frame after it mounts.
  requireName(
    check,
    await check.settle(
      () => check.inspect(listbox),
      (info) => info.name !== "",
      500,
    ),
  );
  const all = await listboxOptions(check, listbox);
  if (all.length === 0) {
    check.fail(listbox, "owns no options");
    return;
  }
  for (const option of all) requireName(check, option);
  const enabled = all.filter((option) => !option.disabled);
  const read = () => listboxState(check, combobox);
  const indexOf = (state: ListboxState) => enabled.findIndex((option) => option.key === state.active?.key);
  const initial = await read();
  if (editable && initial.domFocus)
    check.fail(
      context,
      "moves DOM focus into the listbox; an editable combobox keeps focus in its input and points aria-activedescendant at the active option",
    );
  const start = indexOf(initial);
  if (start === -1) {
    await check.press("ArrowDown");
    if (indexOf(await check.settle(read, (state) => indexOf(state) !== -1)) === -1)
      check.fail(context, "ArrowDown doesn't make any option active");
  }
  // APG leaves Home and End to the caret in an editable combobox.
  const steps: [key: string, expected: number, policy: boolean][] = [
    ["ArrowDown", start === -1 ? -1 : start + 1, false],
    ["ArrowUp", start, false],
    ["End", enabled.length - 1, editable],
    ["Home", 0, editable],
  ];
  for (const [key, expected, policy] of steps.filter(([, index]) => index >= 0 && index < enabled.length)) {
    await check.press(key);
    const state = await check.settle(read, (current) => indexOf(current) === expected);
    if (indexOf(state) !== expected)
      check.fail(
        context,
        `${key} should make ${describe(enabled[expected])} the active option, it's ${state.active ? describe(state.active) : "none"}`,
        { policy },
      );
  }
}

async function checkSelect(check: Check, root: Locator) {
  const triggers = (await check.query(root, '[role="combobox"]')).filter((info) => !info.disabled && info.tag !== "input");
  if (triggers.length === 0) check.fail("select", "no visible select-only combobox");
  for (const trigger of triggers) await checkSelectTrigger(check, trigger);
}

async function checkSelectTrigger(check: Check, trigger: Info) {
  requireName(check, trigger);
  if (isTrue(trigger.attrs["aria-expanded"])) check.fail(trigger, 'has aria-expanded="true" while closed');
  const listbox = await openPopup(check, trigger, "ArrowDown", "listbox");
  if (!listbox) {
    check.fail(trigger, "ArrowDown doesn't open a listbox");
    return;
  }
  if (!isTrue((await check.inspect(trigger)).attrs["aria-expanded"]))
    check.fail(trigger, 'doesn\'t set aria-expanded="true" while its listbox is open');
  const selected = (await listboxOptions(check, listbox)).find((option) => isTrue(option.attrs["aria-selected"]));
  const state = await check.settle(
    () => listboxState(check, trigger),
    (current) => current.active !== null,
  );
  if (selected && state.active?.key !== selected.key)
    check.fail(
      trigger,
      `opening should make the selected option ${describe(selected)} active, it's ${state.active ? describe(state.active) : "none"}`,
    );
  const context = `listbox of ${describe(trigger)}`;
  await checkListboxKeys(check, trigger, listbox, context, { editable: false });
  await expectEscapeCloses(check, trigger, listbox, context);
}

async function checkCombobox(check: Check, root: Locator) {
  const inputs = (await check.query(root, '[role="combobox"]')).filter((info) => !info.disabled && info.tag === "input");
  if (inputs.length === 0) check.fail("combobox", "no visible editable combobox");
  for (const input of inputs) await checkComboboxInput(check, input);
}

async function checkComboboxInput(check: Check, input: Info) {
  requireName(check, input);
  const alwaysOpen = isTrue(input.attrs["aria-expanded"]);
  const listbox = await openPopup(check, input, alwaysOpen ? null : "ArrowDown", "listbox");
  if (!listbox) {
    check.fail(input, "ArrowDown doesn't open a listbox");
    return;
  }
  const opened = await check.inspect(input);
  if (!isTrue(opened.attrs["aria-expanded"])) check.fail(input, 'doesn\'t set aria-expanded="true" while its listbox is open');
  if (opened.attrs["aria-controls"] !== listbox.attrs.id) check.fail(input, "aria-controls doesn't reference the open listbox");
  const context = `listbox of ${describe(input)}`;
  await checkListboxKeys(check, input, listbox, context, { editable: true });
  if (!alwaysOpen) await expectEscapeCloses(check, input, listbox, context);
}

/** APG accepts either aria-modal="true" or the older approach of hiding everything outside the dialog. */
function hidesOutside(check: Check, dialog: Info) {
  return check.locate(dialog).evaluate((element) => {
    const exposed = (sibling: Element, node: Element) =>
      sibling !== node &&
      !sibling.matches("script, style, template, [aria-live]") &&
      sibling.getAttribute("aria-hidden") !== "true" &&
      !sibling.hasAttribute("inert") &&
      (sibling as HTMLElement).checkVisibility();
    for (let node: Element | null = element; node?.parentElement && node !== document.body; node = node.parentElement) {
      const current = node;
      if ([...node.parentElement.children].some((sibling) => exposed(sibling, current))) return false;
    }
    return true;
  });
}

async function checkDialog(check: Check, { trigger }: CheckPatternOptions, role: "dialog" | "alertdialog") {
  if (!trigger) throw new Error(`checkPattern(${role}) needs a trigger option that opens it`);
  const [opener] = await check.query(trigger, "*");
  await check.focus(opener);
  await check.press("Enter");
  const dialog = await check.settle(
    async () => (await check.query(check.page.locator("body"), '[role="dialog"], [role="alertdialog"], dialog')).at(-1) ?? null,
    (found) => found !== null,
    2_000,
  );
  if (!dialog) {
    check.fail(opener, `Enter doesn't open a ${role}`);
    return;
  }
  if (dialog.role !== role) check.fail(dialog, `has role "${dialog.role}", expected ${role}`);
  requireName(check, dialog);
  if (role === "alertdialog" && !(await check.byId(dialog.attrs["aria-describedby"])))
    check.fail(dialog, "has no aria-describedby pointing at its message");
  if (dialog.tag !== "dialog" && dialog.attrs["aria-modal"] !== "true" && !(await hidesOutside(check, dialog))) {
    check.fail(dialog, 'has no aria-modal="true" and leaves the page outside it exposed to assistive technology');
  }
  await checkFocusContained(check, dialog);
  await expectEscapeCloses(check, opener, dialog, `${role} ${describe(dialog)}`);
}

async function checkFocusContained(check: Check, dialog: Info) {
  const inside = () => check.locate(dialog).evaluate((element) => element.contains(document.activeElement));
  if (!(await check.settle(inside, Boolean))) check.fail(dialog, "opening it doesn't move focus inside");
  const tabStops = await check
    .locate(dialog)
    .evaluate(
      (element) =>
        [...element.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]")].filter(
          (node) => (node as HTMLElement).tabIndex >= 0,
        ).length,
    );
  for (const key of ["Tab", "Shift+Tab"]) {
    for (let step = 0; step <= tabStops + 1; step += 1) {
      await check.press(key);
      if (!(await check.settle(inside, Boolean, 300))) {
        check.fail(dialog, `${key} moves focus out of the modal dialog, to ${describeFocus(await check.active())}`);
        break;
      }
    }
  }
}

function checkTree(check: Check, root: Locator) {
  return forEachContainer(check, root, '[role="tree"]', "tree", (tree) => checkTreeItems(check, tree));
}

async function checkTreeItems(check: Check, tree: Info) {
  requireName(check, tree);
  const items = await descendants(check, tree, '[role="treeitem"]', null);
  if (items.length === 0) {
    check.fail(tree, "owns no treeitems");
    return;
  }
  for (const item of items) requireName(check, item);
  const tabbable = items.filter((item) => item.tabbable);
  if (tabbable.length !== 1) check.fail(tree, `has ${tabbable.length} items in the tab sequence, expected 1`);
  const context = `tree ${describe(tree)}`;
  const stops = focusStops(items);
  await check.focus(stops[0]);
  await walk(check, stops, 0, "ArrowDown", context, { wrap: false });
  await check.expectFocusAfter("ArrowUp", [stops[stops.length - 2] ?? stops[0]], context);
  await homeEnd(check, stops, context, { policy: false });
  const parent = stops.find((item) => isTrue(item.attrs["aria-expanded"]));
  if (parent) await checkTreeBranch(check, tree, parent, context);
}

async function checkTreeBranch(check: Check, tree: Info, parent: Info, context: string) {
  const [close, open] = tree.dir === "rtl" ? ["ArrowRight", "ArrowLeft"] : ["ArrowLeft", "ArrowRight"];
  const expanded = () => check.inspect(parent).then((info) => info.attrs["aria-expanded"]);
  await check.focus(parent);
  await check.press(close);
  if ((await check.settle(expanded, (value) => value === "false")) !== "false") check.fail(parent, `${close} doesn't collapse it`);
  await check.press(open);
  if ((await check.settle(expanded, (value) => value === "true")) !== "true") check.fail(parent, `${open} doesn't expand it`);
  // Children nest in a group, or, in a flat tree, follow their parent.
  const firstChild = await check.locate(parent).evaluate((element) => {
    const all = [...(element.closest('[role="tree"]')?.querySelectorAll('[role="treeitem"]') ?? [])];
    const child = element.querySelector('[role="group"] [role="treeitem"]') ?? all[all.indexOf(element) + 1];
    return child ? window.__ariaPatternProbe.inspect(child) : null;
  });
  if (!firstChild) return;
  await check.expectFocusAfter(open, [firstChild], `${context} (${open} on an expanded item)`);
  await check.expectFocusAfter(close, [parent], `${context} (${close} on a child item)`);
}
