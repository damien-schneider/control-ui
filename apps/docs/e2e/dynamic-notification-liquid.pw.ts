import { expect, test } from "@playwright/test";

test("liquid notification initializes without a CSS backdrop-filter fallback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ai/dynamic-notification");

  const island = page.locator('[data-control-ui="dynamic-notification"][data-slot="island"][data-variant="liquid"]');
  const canvas = island.locator('[data-control-ui="dynamic-notification"][data-slot="liquid"]');

  await expect(canvas).toHaveAttribute("data-glass-ready", "true");
  await expect(canvas).not.toHaveAttribute("data-glass-failed");
  await expect(island).toHaveCSS("backdrop-filter", "none");
  await island.getByRole("button", { name: "Assistant" }).click();
  await expect(island).toHaveAttribute("data-state", "expanded");
  await expect.poll(() => canvas.evaluate((element) => (element instanceof HTMLCanvasElement ? element.width : 0))).toBeGreaterThan(300);
});

test("Modern Apple popovers render through the shared refractive WebGL surface", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "control-ui:theme-editor:v1",
      JSON.stringify({
        skin: "modern-apple",
        reduceMotion: true,
        labelMode: "friendly",
        overrides: {},
        light: {},
        dark: {},
        textFixes: {},
      }),
    );
  });
  await page.goto("/primitives/popover");
  await expect(page.locator("html")).toHaveAttribute("data-skin", "modern-apple");
  await page.getByRole("button", { name: "Dimensions", exact: true }).click();

  const popover = page.locator('[data-control-ui="popover"][data-slot="content"]');
  await expect(popover).toHaveAttribute("data-apple-liquid-glass", "active");
  await expect(popover).toHaveAttribute("data-apple-liquid-glass-ready", "true", { timeout: 15_000 });
  await expect(popover).toHaveCSS("backdrop-filter", "none");
  await expect(popover.locator('[data-extension-node="modern-apple-liquid-glass"]')).toHaveCount(1);
});

test("liquid notification transmits a PNG image beneath the surface", async ({ page }) => {
  const fixturePng = await page.evaluate(() => {
    const raster = document.createElement("canvas");
    raster.width = 600;
    raster.height = 300;
    const context = raster.getContext("2d");
    if (!context) throw new Error("Unable to create PNG fixture");
    context.fillStyle = "rgb(16, 64, 248)";
    context.fillRect(0, 0, raster.width / 2, raster.height);
    context.fillStyle = "rgb(248, 48, 16)";
    context.fillRect(raster.width / 2, 0, raster.width / 2, raster.height);
    return raster.toDataURL("image/png").split(",")[1];
  });
  if (!fixturePng) throw new Error("Unable to encode PNG fixture");

  await page.route("**/liquid-glass-e2e.png", async (route) => {
    await route.fulfill({ body: Buffer.from(fixturePng, "base64"), contentType: "image/png" });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ai/dynamic-notification");

  const scene = page.locator("[data-dn-scene]");
  await expect(scene).toHaveCount(1);
  const island = page.locator('[data-control-ui="dynamic-notification"][data-slot="island"][data-variant="liquid"]');
  const canvas = island.locator('[data-control-ui="dynamic-notification"][data-slot="liquid"]');
  await expect(canvas).toHaveAttribute("data-glass-ready", "true");

  await scene.evaluate(async (element) => {
    const backdrop = element.querySelector<HTMLElement>("[data-dn-capture-backdrop]");
    if (!backdrop) throw new Error("Missing notification backdrop");
    backdrop.style.background = "oklch(0.35 0 0)";

    const image = new Image();
    image.src = "/liquid-glass-e2e.png";
    image.dataset.liquidGlassPngFixture = "true";
    Object.assign(image.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      objectFit: "fill",
      zIndex: "1",
    });
    await image.decode();
    element.append(image);
  });

  await page.waitForTimeout(500);
  await expect(canvas).toHaveAttribute("data-glass-ready", "true");
  await expect(canvas).not.toHaveAttribute("data-glass-failed");
  await island.getByRole("button", { name: "Assistant" }).click();
  await expect(island).toHaveAttribute("data-state", "expanded");

  const png = await canvas.screenshot();
  const pixels = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const raster = document.createElement("canvas");
    raster.width = image.naturalWidth;
    raster.height = image.naturalHeight;
    const context = raster.getContext("2d");
    if (!context) throw new Error("Unable to inspect PNG transmission");
    context.drawImage(image, 0, 0);
    const sample = (x: number, y: number) => Array.from(context.getImageData(x, y, 1, 1).data.slice(0, 3));
    const sampleY = Math.floor(raster.height * 0.88);
    return {
      left: sample(Math.floor(raster.width * 0.2), sampleY),
      right: sample(Math.floor(raster.width * 0.8), sampleY),
    };
  }, png.toString("base64"));

  expect(pixels.left[2] - pixels.left[0]).toBeGreaterThan(10);
  expect(pixels.right[0] - pixels.right[2]).toBeGreaterThan(10);
});

test("liquid notification keeps a visible lens field beyond the antialiased rim", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ai/dynamic-notification");

  const scene = page.locator("[data-dn-scene]");
  const island = page.locator('[data-control-ui="dynamic-notification"][data-slot="island"][data-variant="liquid"]');
  const canvas = island.locator('[data-control-ui="dynamic-notification"][data-slot="liquid"]');
  await expect(canvas).toHaveAttribute("data-glass-ready", "true");
  await island.getByRole("button", { name: "Assistant" }).click();
  await expect(island).toHaveAttribute("data-state", "expanded");

  await scene.evaluate(async (element) => {
    const liquidIsland = element.querySelector<HTMLElement>(
      '[data-control-ui="dynamic-notification"][data-slot="island"][data-variant="liquid"]',
    );
    if (!liquidIsland) throw new Error("Missing liquid notification");
    const sceneRect = element.getBoundingClientRect();
    const islandRect = liquidIsland.getBoundingClientRect();
    const raster = document.createElement("canvas");
    raster.width = 32;
    raster.height = Math.max(1, Math.round(islandRect.height));
    const context = raster.getContext("2d");
    if (!context) throw new Error("Unable to create lens fixture");

    const period = 64;
    for (let y = 0; y < raster.height; y += 1) {
      const distanceFromBottom = raster.height - 1 - y;
      const phase = (2 * Math.PI * distanceFromBottom) / period;
      const channel = (offset: number) => Math.round(255 * (0.3 + 0.12 * Math.cos(phase + offset)));
      context.fillStyle = `rgb(${channel(0)}, ${channel((-2 * Math.PI) / 3)}, ${channel((2 * Math.PI) / 3)})`;
      context.fillRect(0, y, raster.width, 1);
    }

    const image = new Image();
    image.src = raster.toDataURL("image/png");
    image.dataset.liquidGlassLensFixture = "true";
    Object.assign(image.style, {
      position: "absolute",
      left: "0",
      top: `${islandRect.top - sceneRect.top}px`,
      width: `${sceneRect.width}px`,
      height: `${islandRect.height}px`,
      pointerEvents: "none",
      zIndex: "1",
    });
    await image.decode();
    element.append(image);
  });

  await page.waitForTimeout(500);
  await expect(canvas).toHaveAttribute("data-glass-ready", "true");
  await expect(canvas).not.toHaveAttribute("data-glass-failed");

  const png = await canvas.screenshot();
  const lens = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const raster = document.createElement("canvas");
    raster.width = image.naturalWidth;
    raster.height = image.naturalHeight;
    const context = raster.getContext("2d");
    if (!context) throw new Error("Unable to inspect lens fixture");
    context.drawImage(image, 0, 0);

    const displacement = (distanceFromBottom: number) => {
      const y = raster.height - 1 - distanceFromBottom;
      const startX = Math.floor(raster.width * 0.46);
      const endX = Math.ceil(raster.width * 0.54);
      let red = 0;
      let green = 0;
      let blue = 0;
      for (let x = startX; x < endX; x += 1) {
        const pixel = context.getImageData(x, y, 1, 1).data;
        red += pixel[0] ?? 0;
        green += pixel[1] ?? 0;
        blue += pixel[2] ?? 0;
      }
      const count = Math.max(endX - startX, 1);
      red /= count;
      green /= count;
      blue /= count;
      const phaseX = red - (green + blue) * 0.5;
      const phaseY = (Math.sqrt(3) * (green - blue)) / 2;
      const phase = (Math.atan2(phaseY, phaseX) + Math.PI * 2) % (Math.PI * 2);
      const wrappedSourceDistance = (phase / (Math.PI * 2)) * 64;
      const sourceDistance = wrappedSourceDistance + Math.round((distanceFromBottom - wrappedSourceDistance) / 64) * 64;
      return {
        chroma: Math.hypot(phaseX, phaseY),
        displacement: sourceDistance - distanceFromBottom,
      };
    };

    return Array.from({ length: 39 }, (_, index) => displacement(index + 2));
  }, png.toString("base64"));

  const displacements = lens.map((sample) => sample.displacement);
  const medianMidBand = [...displacements.slice(8, 11)].sort((left, right) => left - right)[1] ?? 0;
  const interiorDisplacements = displacements
    .slice(32)
    .map(Math.abs)
    .sort((left, right) => left - right);
  const medianInterior = interiorDisplacements[Math.floor(interiorDisplacements.length / 2)] ?? Number.POSITIVE_INFINITY;
  const visibleWidth = displacements.reduce((lastVisible, value, index) => (value >= 1 ? index + 2 : lastVisible), 0);

  expect(Math.min(...lens.slice(0, 17).map((sample) => sample.chroma)), JSON.stringify(lens)).toBeGreaterThanOrEqual(10);
  expect(Math.max(...displacements.slice(0, 13)), JSON.stringify(displacements)).toBeGreaterThanOrEqual(6);
  expect(Math.max(...displacements.slice(0, 13)), JSON.stringify(displacements)).toBeLessThanOrEqual(24);
  expect(medianMidBand, JSON.stringify(displacements)).toBeGreaterThanOrEqual(4);
  expect(visibleWidth, JSON.stringify(displacements)).toBeGreaterThanOrEqual(24);
  expect(medianInterior, JSON.stringify(displacements)).toBeLessThanOrEqual(1.25);
  expect(Math.max(...interiorDisplacements), JSON.stringify(displacements)).toBeLessThanOrEqual(2.5);

  const geometry = await scene.evaluate(async (element) => {
    const liquidIsland = element.querySelector<HTMLElement>(
      '[data-control-ui="dynamic-notification"][data-slot="island"][data-variant="liquid"]',
    );
    const fixture = element.querySelector<HTMLImageElement>('[data-liquid-glass-lens-fixture="true"]');
    if (!liquidIsland || !fixture) throw new Error("Missing liquid lens fixture");
    const sceneRect = element.getBoundingClientRect();
    const islandRect = liquidIsland.getBoundingClientRect();
    const raster = document.createElement("canvas");
    raster.width = Math.max(1, Math.round(islandRect.width));
    raster.height = 32;
    const context = raster.getContext("2d");
    if (!context) throw new Error("Unable to create horizontal lens fixture");

    for (let x = 0; x < raster.width; x += 1) {
      const phase = (2 * Math.PI * x) / 64;
      const channel = (offset: number) => Math.round(255 * (0.3 + 0.12 * Math.cos(phase + offset)));
      context.fillStyle = `rgb(${channel(0)}, ${channel((-2 * Math.PI) / 3)}, ${channel((2 * Math.PI) / 3)})`;
      context.fillRect(x, 0, 1, raster.height);
    }

    fixture.src = raster.toDataURL("image/png");
    Object.assign(fixture.style, {
      left: `${islandRect.left - sceneRect.left}px`,
      top: `${islandRect.top - sceneRect.top}px`,
      width: `${islandRect.width}px`,
      height: `${islandRect.height}px`,
    });
    await fixture.decode();
    return {
      height: islandRect.height,
      radius: Number.parseFloat(getComputedStyle(liquidIsland).borderBottomLeftRadius),
      width: islandRect.width,
    };
  });

  await page.waitForTimeout(500);
  const horizontalPng = await canvas.screenshot();
  const corner = await page.evaluate(
    async ({ geometry: panel, horizontal, vertical }) => {
      const decodeImage = async (base64: string) => {
        const image = new Image();
        image.src = `data:image/png;base64,${base64}`;
        await image.decode();
        const raster = document.createElement("canvas");
        raster.width = image.naturalWidth;
        raster.height = image.naturalHeight;
        const context = raster.getContext("2d");
        if (!context) throw new Error("Unable to decode corner fixture");
        context.drawImage(image, 0, 0);
        return { context, height: raster.height, width: raster.width };
      };
      const xImage = await decodeImage(horizontal);
      const yImage = await decodeImage(vertical);
      const scaleX = xImage.width / panel.width;
      const scaleY = xImage.height / panel.height;

      const decodeDisplacement = (
        image: Awaited<ReturnType<typeof decodeImage>>,
        xCss: number,
        distanceFromBottomCss: number,
        outputCoordinate: number,
      ) => {
        const centerX = Math.round(xCss * scaleX);
        const centerY = Math.round(image.height - 1 - distanceFromBottomCss * scaleY);
        let red = 0;
        let green = 0;
        let blue = 0;
        let count = 0;
        for (let y = centerY - 1; y <= centerY + 1; y += 1) {
          for (let x = centerX - 1; x <= centerX + 1; x += 1) {
            const pixel = image.context.getImageData(x, y, 1, 1).data;
            red += pixel[0] ?? 0;
            green += pixel[1] ?? 0;
            blue += pixel[2] ?? 0;
            count += 1;
          }
        }
        red /= count;
        green /= count;
        blue /= count;
        const phaseX = red - (green + blue) * 0.5;
        const phaseY = (Math.sqrt(3) * (green - blue)) / 2;
        const phase = (Math.atan2(phaseY, phaseX) + Math.PI * 2) % (Math.PI * 2);
        const wrappedSource = (phase / (Math.PI * 2)) * 64;
        const source = wrappedSource + Math.round((outputCoordinate - wrappedSource) / 64) * 64;
        return source - outputCoordinate;
      };

      const cornerSample = (inset: number) => {
        const coordinate = panel.radius - (panel.radius - inset) / Math.sqrt(2);
        const dx = decodeDisplacement(xImage, coordinate, coordinate, coordinate);
        const dy = decodeDisplacement(yImage, coordinate, coordinate, coordinate);
        return { angle: (Math.atan2(dy, dx) * 180) / Math.PI, dx, dy, magnitude: Math.hypot(dx, dy) };
      };

      return {
        inset4: cornerSample(4),
        inset10: cornerSample(10),
        bottomCenter: {
          dx: decodeDisplacement(xImage, panel.width / 2, 4, panel.width / 2),
          dy: decodeDisplacement(yImage, panel.width / 2, 4, 4),
        },
      };
    },
    {
      geometry,
      horizontal: horizontalPng.toString("base64"),
      vertical: png.toString("base64"),
    },
  );

  expect(corner.inset4.magnitude, JSON.stringify(corner)).toBeGreaterThanOrEqual(8);
  expect(corner.inset4.angle, JSON.stringify(corner)).toBeGreaterThanOrEqual(25);
  expect(corner.inset4.angle, JSON.stringify(corner)).toBeLessThanOrEqual(65);
  expect(corner.inset10.magnitude, JSON.stringify(corner)).toBeGreaterThanOrEqual(4);
  expect(corner.inset10.angle, JSON.stringify(corner)).toBeGreaterThanOrEqual(25);
  expect(corner.inset10.angle, JSON.stringify(corner)).toBeLessThanOrEqual(65);
  expect(Math.abs(corner.bottomCenter.dx), JSON.stringify(corner)).toBeLessThanOrEqual(1.5);
  expect(corner.bottomCenter.dy, JSON.stringify(corner)).toBeGreaterThanOrEqual(10);
});

const thinkingMaterials = [
  { label: "liquid", variant: "liquid", canvasSlot: "liquid" },
  { label: "backdrop blur", variant: "glass", canvasSlot: "glass", picker: "Backdrop blur" },
] as const;

for (const material of thinkingMaterials) {
  test(`${material.label} thinking ribbon stays on the ink horizon`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/ai/dynamic-notification");
    if ("picker" in material) {
      const initialCanvas = page.locator(
        '[data-control-ui="dynamic-notification"][data-slot="island"][data-variant="liquid"] [data-control-ui="dynamic-notification"][data-slot="liquid"]',
      );
      await expect(initialCanvas).toHaveAttribute("data-glass-ready", "true");
      const picker = page.getByRole("button", { name: material.picker, exact: true });
      await picker.click();
      await expect(picker).toHaveAttribute("aria-pressed", "true");
    }

    const island = page.locator(`[data-control-ui="dynamic-notification"][data-slot="island"][data-variant="${material.variant}"]`);
    const canvas = island.locator(`[data-control-ui="dynamic-notification"][data-slot="${material.canvasSlot}"]`);
    await expect(canvas).toHaveAttribute("data-glass-ready", "true");
    await page.getByRole("button", { name: "Send a notification", exact: true }).click();
    await expect(island).toHaveAttribute("data-state", "thinking");
    await page.waitForTimeout(100);

    const stops = await island.evaluate((element) => {
      const styles = getComputedStyle(element);
      return ["--dn-ink-plateau", "--dn-ink-mid-stop", "--dn-ink-low-stop", "--dn-ink-tail-stop"].map((property) =>
        Number.parseFloat(styles.getPropertyValue(property)),
      );
    });
    expect(stops).toEqual([40, 47, 53, 60]);

    const png = await canvas.screenshot();
    const ribbonRatio = await page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const raster = document.createElement("canvas");
      raster.width = image.naturalWidth;
      raster.height = image.naturalHeight;
      const context = raster.getContext("2d");
      if (!context) throw new Error("Unable to inspect thinking material screenshot");
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, raster.width, raster.height).data;
      const startX = Math.floor(raster.width * 0.35);
      const endX = Math.ceil(raster.width * 0.65);
      const startY = Math.floor(raster.height * 0.35);
      const endY = Math.ceil(raster.height * 0.65);
      let ribbonRow = startY;
      let ribbonEnergy = -1;

      for (let yPosition = startY; yPosition < endY; yPosition += 1) {
        let energy = 0;
        for (let xPosition = startX; xPosition < endX; xPosition += 1) {
          const offset = (yPosition * raster.width + xPosition) * 4;
          energy += Math.max(pixels[offset] ?? 0, pixels[offset + 1] ?? 0, pixels[offset + 2] ?? 0);
        }
        if (energy > ribbonEnergy) {
          ribbonEnergy = energy;
          ribbonRow = yPosition;
        }
      }

      return ribbonRow / raster.height;
    }, png.toString("base64"));

    expect(Math.abs(ribbonRatio - 0.5)).toBeLessThan(0.06);
  });
}
