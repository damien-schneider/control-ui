import { expect, type Locator, test } from "@playwright/test";

async function alignmentError(target: Locator, indicator: Locator) {
  const [targetBox, indicatorBox] = await Promise.all([target.boundingBox(), indicator.boundingBox()]);
  if (!targetBox || !indicatorBox) return Number.POSITIVE_INFINITY;
  return Math.max(
    Math.abs(targetBox.x - indicatorBox.x),
    Math.abs(targetBox.y - indicatorBox.y),
    Math.abs(targetBox.width - indicatorBox.width),
    Math.abs(targetBox.height - indicatorBox.height),
  );
}

async function horizontalInsetError(container: Locator, content: Locator) {
  const [containerBox, contentBox] = await Promise.all([container.boundingBox(), content.boundingBox()]);
  if (!containerBox || !contentBox) return Number.POSITIVE_INFINITY;
  const leftInset = contentBox.x - containerBox.x;
  const rightInset = containerBox.x + containerBox.width - (contentBox.x + contentBox.width);
  return Math.abs(leftInset - rightInset);
}

async function cornerRadii(locator: Locator) {
  return locator.evaluate((element) => {
    const styles = getComputedStyle(element);
    return [styles.borderTopLeftRadius, styles.borderTopRightRadius, styles.borderBottomRightRadius, styles.borderBottomLeftRadius];
  });
}

test("floating toolbar pill chases hover and yields active emphasis", async ({ page }) => {
  await page.goto("/primitives/button");

  const toolbar = page.locator("[data-docs-floating-toolbar]");
  const modes = page.getByRole("navigation", { name: "Documentation sections" });
  const activeMode = modes.locator("[aria-current=page]");
  const hoveredMode = modes.getByTitle("Skills");
  const idleMode = modes.getByTitle("AI");
  const pill = modes.locator('[data-control-ui="track-highlight"][data-slot="root"]');

  await expect(toolbar).toHaveAttribute("role", "toolbar");
  // Single-layer mode: no dedicated hover layer, the one pill serves both states.
  await expect(modes.locator('[data-control-ui="track-highlight"][data-slot="hover"]')).toHaveCount(0);
  await expect(pill).toHaveAttribute("data-visible", "");
  await expect(pill).not.toHaveAttribute("data-hover", "");
  await expect.poll(() => alignmentError(activeMode, pill)).toBeLessThan(1);

  const cssColor = (locator: Locator) => locator.evaluate((element) => getComputedStyle(element).color);
  const restBackground = await pill.evaluate((element) => getComputedStyle(element).backgroundColor);
  const restActiveColor = await cssColor(activeMode);
  expect(restActiveColor).not.toBe(await cssColor(idleMode));

  await toolbar.evaluate((element) => {
    element.setAttribute("style", "--duration-slow: 10s; --ease-emphasized: linear");
  });
  await hoveredMode.hover();
  // Pill leaves the active row: hover paint on the pill, track flags the chase, active row yields its emphasis.
  await expect(pill).toHaveAttribute("data-hover", "");
  await expect(modes).toHaveAttribute("data-track-hover", "");
  await expect.poll(() => cssColor(activeMode)).toBe(await cssColor(idleMode));

  const hoverMotion = await pill.evaluate((element) => {
    const transitions = element
      .getAnimations()
      .filter((animation): animation is CSSTransition => animation instanceof CSSTransition && animation.transitionProperty !== "opacity");
    for (const transition of transitions) {
      transition.pause();
      transition.currentTime = 5_000;
    }
    return transitions.map((transition) => ({
      property: transition.transitionProperty,
      duration: transition.effect?.getTiming().duration,
      easing: transition.effect?.getTiming().easing,
    }));
  });

  expect(hoverMotion.some(({ property }) => property === "left" || property === "right")).toBe(true);
  expect(hoverMotion.every(({ duration, easing }) => duration === 10_000 && easing === "linear")).toBe(true);

  const [activeBox, hoveredBox, midpointBox] = await Promise.all([activeMode.boundingBox(), hoveredMode.boundingBox(), pill.boundingBox()]);
  expect(activeBox).not.toBeNull();
  expect(hoveredBox).not.toBeNull();
  expect(midpointBox).not.toBeNull();
  expect(midpointBox?.x).toBeGreaterThan(activeBox?.x ?? Number.POSITIVE_INFINITY);
  expect(midpointBox?.x).toBeLessThan(hoveredBox?.x ?? Number.NEGATIVE_INFINITY);

  await pill.evaluate((element) =>
    element.getAnimations().forEach((animation) => {
      animation.finish();
    }),
  );
  await expect.poll(() => alignmentError(hoveredMode, pill)).toBeLessThan(1);
  await expect(activeMode).toHaveAttribute("aria-current", "page");
  // Visiting paint ≠ resting paint, and rows never regrow their own background under the pill.
  expect(await pill.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(restBackground);
  await expect(hoveredMode).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

  expect(await cornerRadii(pill)).toEqual(await cornerRadii(hoveredMode));

  const concentricGeometry = await toolbar.evaluate((element) => {
    const toolbarStyles = getComputedStyle(element);
    const item = element.querySelector<HTMLElement>('[data-control-ui="track-highlight"][data-slot="root"]');
    if (!item) return null;
    return {
      outerRadius: Number.parseFloat(toolbarStyles.borderTopLeftRadius),
      itemRadius: Number.parseFloat(getComputedStyle(item).borderTopLeftRadius),
      padding: Number.parseFloat(toolbarStyles.paddingLeft),
    };
  });
  expect(concentricGeometry).not.toBeNull();
  expect(concentricGeometry?.outerRadius).toBeCloseTo((concentricGeometry?.itemRadius ?? 0) + (concentricGeometry?.padding ?? 0), 1);

  // Restore real tempo before leaving so the return trip settles within poll timeouts.
  await toolbar.evaluate((element) => element.removeAttribute("style"));
  await page.mouse.move(0, 0);
  // Pointer gone: pill returns home with its resting paint and the active row re-emphasizes.
  await expect(pill).not.toHaveAttribute("data-hover", "");
  await expect(modes).not.toHaveAttribute("data-track-hover", "");
  await expect.poll(() => alignmentError(activeMode, pill)).toBeLessThan(1);
  await expect.poll(() => pill.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(restBackground);
  await expect.poll(() => cssColor(activeMode)).toBe(restActiveColor);
});

test("search closes without moving through a second focus state", async ({ page }) => {
  await page.goto("/primitives/button");
  await page.waitForLoadState("networkidle");

  const toolbar = page.locator("[data-docs-floating-toolbar]");
  const search = toolbar.getByRole("combobox", { name: "Search documentation" });
  const close = toolbar.getByRole("button", { name: "Close search" });
  const results = toolbar.locator('[data-control-ui="command"][data-slot="list"]');

  await search.fill("architecture");
  await expect(results).toBeVisible();

  await close.hover();
  await page.mouse.down();
  await expect(search).toBeFocused();
  await page.mouse.up();

  await expect(search).toHaveValue("");
  await expect(results).toBeHidden();
  await expect(close).toBeHidden();
});

test("active search keeps balanced outer spacing", async ({ page }) => {
  await page.goto("/primitives/button");
  await page.waitForLoadState("networkidle");

  const toolbar = page.locator("[data-docs-floating-toolbar]");
  const search = toolbar.getByRole("combobox", { name: "Search documentation" });
  const searchShell = search.locator("..");

  await search.focus();

  await expect.poll(() => horizontalInsetError(toolbar, searchShell)).toBeLessThan(1);
});

for (const { name, width, height } of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`floating toolbar uses fixed theme-driven width endpoints on ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/primitives/button");

    const toolbar = page.locator("[data-docs-floating-toolbar]");
    const selectionHighlight = toolbar.locator('[data-control-ui="track-highlight"][data-slot="root"]');
    const mode = toolbar.getByTitle("Skills");
    const search = toolbar.locator('input[aria-label="Search documentation"]');
    await expect(selectionHighlight).toHaveAttribute("data-visible", "");

    const endpoints = await toolbar.evaluate((element) => {
      const resolveLength = (property: string) => {
        const probe = document.createElement("div");
        probe.style.position = "absolute";
        probe.style.width = `var(${property})`;
        element.append(probe);
        const resolvedWidth = probe.getBoundingClientRect().width;
        probe.remove();
        return resolvedWidth;
      };
      return {
        rest: resolveLength("--floating-toolbar-rest-width"),
        search: resolveLength("--floating-toolbar-search-width"),
        maximum: window.innerWidth - 16,
      };
    });
    const restingWidth = await toolbar.evaluate((element) => element.getBoundingClientRect().width);
    expect(restingWidth).toBeCloseTo(Math.min(endpoints.rest, endpoints.maximum), 1);

    await mode.focus();
    await expect.poll(() => toolbar.evaluate((element) => element.getBoundingClientRect().width)).toBeCloseTo(restingWidth, 1);

    await toolbar.evaluate((element) => {
      element.setAttribute("style", "--duration-base: 10s; --ease-standard: linear");
    });
    await search.focus();

    const widthMotion = await toolbar.evaluate((element) => {
      const transition = element
        .getAnimations()
        .find((animation): animation is CSSTransition => animation instanceof CSSTransition && animation.transitionProperty === "width");
      if (!transition) return null;
      transition.pause();
      transition.currentTime = 5_000;
      return {
        duration: transition.effect?.getTiming().duration,
        easing: transition.effect?.getTiming().easing,
      };
    });
    expect(widthMotion).toEqual({ duration: 10_000, easing: "linear" });

    const midpointWidth = await toolbar.evaluate((element) => element.getBoundingClientRect().width);
    const expandedWidth = Math.min(endpoints.search, endpoints.maximum);
    expect(midpointWidth).toBeGreaterThan(restingWidth);
    expect(midpointWidth).toBeLessThan(expandedWidth);

    await toolbar.evaluate((element) =>
      element.getAnimations().forEach((animation) => {
        animation.finish();
      }),
    );
    await expect.poll(() => toolbar.evaluate((element) => element.getBoundingClientRect().width)).toBeCloseTo(expandedWidth, 1);
  });
}
