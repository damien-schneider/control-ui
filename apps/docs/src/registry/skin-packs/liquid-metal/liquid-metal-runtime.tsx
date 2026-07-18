"use client";

import { createInstance, destroyInstance, type MetalFxInstance, type MetalFxPreset, setSharedPreset, updateInstance } from "metal-fx";
import { useEffect } from "react";

const controlSelector = '[data-control-ui][data-control="true"]';
const skinScopeSelector = "[data-skin-scope]";
const canvasNode = "liquid-metal-canvas";
const innerNode = "liquid-metal-inner";
const chromeSelector = '[data-extension-node="liquid-metal-canvas"], [data-extension-node="liquid-metal-inner"]';
const defaultPreset: MetalFxPreset = "chromatic";
const squircleExponent = 4;
const squircleCornerSteps = 10;

type LiquidCornerShape = "round" | "squircle" | "scoop";

type LiquidMetalGeometry = {
  cssWidth: number;
  cssHeight: number;
  cornerRadius: number;
  cornerShape: LiquidCornerShape;
  kind: "circle" | "pill";
  ringCssPx: number;
  shaderScale: number;
};

type LiquidMetalMaskState = {
  canvas: HTMLCanvasElement;
  cache?: {
    innerPath: Path2D;
    key: string;
    outerPath: Path2D;
  };
  ctx?: CanvasRenderingContext2D | null;
  geometry: LiquidMetalGeometry;
};

type LiquidMetalAttachment = {
  canvas: HTMLCanvasElement;
  inner: HTMLSpanElement;
  instance: MetalFxInstance;
  maskState: LiquidMetalMaskState;
  resizeObserver: ResizeObserver;
  intersectionObserver?: IntersectionObserver;
  previousStyle: {
    cornerShape: string;
    isolation: string;
    overflow: string;
    position: string;
  };
};

function activeSkin() {
  return document.documentElement.dataset.skin === "liquid-metal";
}

function activeTheme(): "dark" | "light" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function normalizeCornerShape(value: string): LiquidCornerShape {
  const normalized = value.toLowerCase();
  if (normalized.includes("squircle") || normalized.includes("superellipse")) return "squircle";
  if (normalized.includes("scoop")) return "scoop";
  return "round";
}

function controlCornerShape(styles: CSSStyleDeclaration): LiquidCornerShape {
  return normalizeCornerShape(
    [
      styles.getPropertyValue("corner-shape"),
      styles.getPropertyValue("--corner-shape-control"),
      styles.getPropertyValue("--corner-shape"),
    ].join(" "),
  );
}

function controlKind(rect: DOMRectReadOnly, cornerRadius: number, cornerShape: LiquidCornerShape): "circle" | "pill" {
  if (cornerShape !== "round") return "pill";

  const minSide = Math.min(rect.width, rect.height);
  const isNearlySquare = rect.width <= rect.height * 1.18 && rect.height <= rect.width * 1.18;
  return isNearlySquare && cornerRadius >= minSide / 2 - 0.5 ? "circle" : "pill";
}

function controlRadius(styles: CSSStyleDeclaration, rect: DOMRectReadOnly) {
  const parsed = Number.parseFloat(styles.borderTopLeftRadius);
  if (Number.isFinite(parsed)) return Math.min(Math.max(parsed, 0), Math.min(rect.width, rect.height) / 2);
  return Math.min(rect.width, rect.height) / 2;
}

function controlTuning(kind: LiquidMetalGeometry["kind"]) {
  return {
    ringCssPx: kind === "circle" ? 2 : 1.15,
    shaderScale: kind === "circle" ? 1.35 : 1.62,
  };
}

function measureControl(control: HTMLElement) {
  const rect = control.getBoundingClientRect();
  const styles = getComputedStyle(control);
  const cssWidth = Math.max(1, Math.round(rect.width));
  const cssHeight = Math.max(1, Math.round(rect.height));
  const cornerRadius = controlRadius(styles, rect);
  const cornerShape = controlCornerShape(styles);
  const kind = controlKind(rect, cornerRadius, cornerShape);

  return {
    cssWidth,
    cssHeight,
    cornerRadius,
    cornerShape,
    kind,
    ...controlTuning(kind),
  };
}

function appendSquircleCorner(path: Path2D, cx: number, cy: number, radius: number, start: number, end: number) {
  const power = 2 / squircleExponent;

  for (let i = 1; i <= squircleCornerSteps; i++) {
    const angle = start + ((end - start) * i) / squircleCornerSteps;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = cx + Math.sign(cos) * Math.abs(cos) ** power * radius;
    const y = cy + Math.sign(sin) * Math.abs(sin) ** power * radius;
    path.lineTo(x, y);
  }
}

function squircleRectPath(x: number, y: number, width: number, height: number, radius: number) {
  const path = new Path2D();
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const safeRadius = Math.min(Math.max(radius, 0), Math.min(safeWidth, safeHeight) / 2);

  if (safeWidth <= 0 || safeHeight <= 0) return path;
  if (safeRadius <= 0) {
    path.rect(x, y, safeWidth, safeHeight);
    return path;
  }

  const right = x + safeWidth;
  const bottom = y + safeHeight;

  path.moveTo(x + safeRadius, y);
  path.lineTo(right - safeRadius, y);
  appendSquircleCorner(path, right - safeRadius, y + safeRadius, safeRadius, -Math.PI / 2, 0);
  path.lineTo(right, bottom - safeRadius);
  appendSquircleCorner(path, right - safeRadius, bottom - safeRadius, safeRadius, 0, Math.PI / 2);
  path.lineTo(x + safeRadius, bottom);
  appendSquircleCorner(path, x + safeRadius, bottom - safeRadius, safeRadius, Math.PI / 2, Math.PI);
  path.lineTo(x, y + safeRadius);
  appendSquircleCorner(path, x + safeRadius, y + safeRadius, safeRadius, Math.PI, (Math.PI * 3) / 2);
  path.closePath();

  return path;
}

function applySquircleCanvasMask(maskState: LiquidMetalMaskState) {
  const { canvas, geometry } = maskState;
  if (geometry.cornerShape !== "squircle" || geometry.cornerRadius <= 0) return;

  const width = canvas.width;
  const height = canvas.height;
  if (width <= 1 || height <= 1) return;

  const ctx = maskState.ctx ?? canvas.getContext("2d");
  if (!ctx) return;
  maskState.ctx = ctx;

  const dpr = Math.min(width / geometry.cssWidth, height / geometry.cssHeight);
  const ringPx = Math.max(0, geometry.ringCssPx * dpr);
  const outerRadius = Math.min(geometry.cornerRadius * dpr, Math.min(width, height) / 2);
  const innerRadius = Math.max(0, outerRadius - ringPx);
  const innerWidth = Math.max(0, width - ringPx * 2);
  const innerHeight = Math.max(0, height - ringPx * 2);
  const cacheKey = [width, height, ringPx.toFixed(3), outerRadius.toFixed(3), innerRadius.toFixed(3)].join(":");

  if (maskState.cache?.key !== cacheKey) {
    maskState.cache = {
      key: cacheKey,
      outerPath: squircleRectPath(0, 0, width, height, outerRadius),
      innerPath: squircleRectPath(ringPx, ringPx, innerWidth, innerHeight, innerRadius),
    };
  }

  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.fill(maskState.cache.outerPath);
  ctx.globalCompositeOperation = "destination-out";
  ctx.fill(maskState.cache.innerPath);
  ctx.restore();
}

function createChromeNode<K extends keyof HTMLElementTagNameMap>(tagName: K, node: string) {
  const element = document.createElement(tagName);
  element.setAttribute("aria-hidden", "true");
  element.dataset.extensionNode = node;
  return element;
}

function styleChromeNodes(canvas: HTMLCanvasElement, inner: HTMLSpanElement) {
  Object.assign(canvas.style, {
    borderRadius: "var(--aui-liquid-metal-radius, inherit)",
    display: "block",
    height: "100%",
    inset: "0",
    opacity: "0",
    pointerEvents: "none",
    position: "absolute",
    transition: "opacity var(--duration-fast) var(--ease-standard)",
    width: "100%",
    zIndex: "1",
  });
  canvas.style.setProperty("corner-shape", "var(--corner-shape-control, var(--corner-shape, round))");

  Object.assign(inner.style, {
    background:
      "linear-gradient(180deg, var(--aui-liquid-control-fill-top, oklch(1 0 0 / 0.04)), transparent 48%), var(--aui-liquid-control-fill, oklch(0.2484 0 0 / 0.76))",
    borderRadius: "max(0px, calc(var(--aui-liquid-metal-radius, var(--radius-control)) - 3px))",
    boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.03), inset 0 1px 0 oklch(1 0 0 / 0.05)",
    inset: "3px",
    pointerEvents: "none",
    position: "absolute",
    zIndex: "1",
  });
  inner.style.setProperty("corner-shape", "var(--corner-shape-control, var(--corner-shape, round))");
}

function primeControl(control: HTMLElement) {
  const previousStyle = {
    cornerShape: control.style.getPropertyValue("corner-shape"),
    isolation: control.style.isolation,
    overflow: control.style.overflow,
    position: control.style.position,
  };

  if (getComputedStyle(control).position === "static") {
    control.style.position = "relative";
  }
  control.style.isolation = "isolate";
  control.style.overflow = "visible";
  control.style.setProperty("corner-shape", "var(--corner-shape-control, var(--corner-shape, round))");

  return previousStyle;
}

function restoreControl(control: HTMLElement, previousStyle: LiquidMetalAttachment["previousStyle"]) {
  control.style.isolation = previousStyle.isolation;
  control.style.overflow = previousStyle.overflow;
  control.style.position = previousStyle.position;
  if (previousStyle.cornerShape) {
    control.style.setProperty("corner-shape", previousStyle.cornerShape);
  } else {
    control.style.removeProperty("corner-shape");
  }
}

function cleanupStaleChrome(root: HTMLElement, attachments: Map<HTMLElement, LiquidMetalAttachment>) {
  const ownedNodes = new Set<Node>();
  for (const attachment of attachments.values()) {
    ownedNodes.add(attachment.canvas);
    ownedNodes.add(attachment.inner);
  }

  for (const node of root.querySelectorAll(chromeSelector)) {
    if (!ownedNodes.has(node)) node.remove();
  }

  for (const control of root.querySelectorAll<HTMLElement>('[data-liquid-metal="active"]')) {
    if (!attachments.has(control)) {
      delete control.dataset.liquidMetal;
      delete control.dataset.liquidMetalReady;
      delete control.dataset.liquidCornerShape;
    }
  }
}

function attachControl(control: HTMLElement, attachments: Map<HTMLElement, LiquidMetalAttachment>) {
  if (attachments.has(control) || control.dataset.liquidMetal === "unsupported") return;

  const geometry = measureControl(control);
  const canvas = createChromeNode("canvas", canvasNode);
  const inner = createChromeNode("span", innerNode);
  const maskState: LiquidMetalMaskState = { canvas, geometry };
  styleChromeNodes(canvas, inner);

  const previousStyle = primeControl(control);
  control.prepend(canvas, inner);
  control.dataset.liquidMetal = "active";
  control.dataset.liquidCornerShape = geometry.cornerShape;

  try {
    const instance = createInstance({
      hostCanvas: canvas,
      cssWidth: geometry.cssWidth,
      cssHeight: geometry.cssHeight,
      cornerRadius: geometry.cornerRadius,
      kind: geometry.kind,
      ringCssPx: geometry.ringCssPx,
      shaderScale: geometry.shaderScale,
      opacityMul: 1,
      onAfterFrame: () => {
        applySquircleCanvasMask(maskState);
      },
      onFirstCopy: () => {
        control.dataset.liquidMetalReady = "true";
        canvas.style.opacity = "1";
      },
    });
    maskState.ctx = instance.ctx;

    const resizeObserver = new ResizeObserver(() => {
      syncControlGeometry(control, instance, maskState);
    });
    resizeObserver.observe(control);

    const attachment: LiquidMetalAttachment = { canvas, inner, instance, maskState, previousStyle, resizeObserver };

    if (typeof IntersectionObserver !== "undefined") {
      attachment.intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          updateInstance(instance, { paused: !entry?.isIntersecting });
        },
        { rootMargin: "96px" },
      );
      attachment.intersectionObserver.observe(control);
    }

    control.style.setProperty("--aui-liquid-metal-radius", `${geometry.cornerRadius}px`);
    attachments.set(control, attachment);
  } catch {
    canvas.remove();
    inner.remove();
    restoreControl(control, previousStyle);
    control.dataset.liquidMetal = "unsupported";
    delete control.dataset.liquidCornerShape;
  }
}

function syncControlGeometry(control: HTMLElement, instance: MetalFxInstance, maskState: LiquidMetalMaskState) {
  const next = measureControl(control);
  maskState.geometry = next;
  updateInstance(instance, {
    cornerRadius: next.cornerRadius,
    cssHeight: next.cssHeight,
    cssWidth: next.cssWidth,
    kind: next.kind,
    ringCssPx: next.ringCssPx,
    shaderScale: next.shaderScale,
  });
  control.style.setProperty("--aui-liquid-metal-radius", `${next.cornerRadius}px`);
  control.dataset.liquidCornerShape = next.cornerShape;
}

function detachControl(control: HTMLElement, attachment: LiquidMetalAttachment) {
  attachment.resizeObserver.disconnect();
  attachment.intersectionObserver?.disconnect();
  destroyInstance(attachment.instance);
  attachment.canvas.remove();
  attachment.inner.remove();
  restoreControl(control, attachment.previousStyle);
  control.style.removeProperty("--aui-liquid-metal-radius");
  delete control.dataset.liquidMetal;
  delete control.dataset.liquidMetalReady;
  delete control.dataset.liquidCornerShape;
}

function syncControls(root: HTMLElement, attachments: Map<HTMLElement, LiquidMetalAttachment>) {
  cleanupStaleChrome(root, attachments);

  if (!activeSkin()) {
    for (const [control, attachment] of attachments) {
      detachControl(control, attachment);
    }
    attachments.clear();
    return;
  }

  setSharedPreset(defaultPreset, activeTheme());

  // Attach new controls before detaching stale ones: metal-fx's shared WebGL context tears
  // down when instance count hits 0 and can't rebuild same-tick. Skin swaps remount the whole
  // subtree, so attach-before-detach keeps count >0 across the swap.
  for (const scope of root.querySelectorAll<HTMLElement>(skinScopeSelector)) {
    for (const control of scope.querySelectorAll<HTMLElement>(controlSelector)) {
      attachControl(control, attachments);
    }
  }

  for (const [control, attachment] of attachments) {
    if (!root.contains(control) || !control.matches(controlSelector) || !control.closest(skinScopeSelector)) {
      detachControl(control, attachment);
      attachments.delete(control);
    } else {
      control.dataset.liquidMetal = "active";
      syncControlGeometry(control, attachment.instance, attachment.maskState);
    }
  }
}

export function LiquidMetalSkinRuntime() {
  useEffect(() => {
    const root = document.body;
    const attachments = new Map<HTMLElement, LiquidMetalAttachment>();
    let syncRaf = 0;
    // Body-wide observer only runs while this skin is active (else burns a callback on every
    // DOM mutation for nothing); documentElement attribute observer below stays always-on and
    // detects (de)activation.
    let domObserver: MutationObserver | null = null;

    const scheduleSync = () => {
      if (syncRaf !== 0) return;
      syncRaf = requestAnimationFrame(() => {
        syncRaf = 0;
        // Sync first (handles both attach and detach), then toggle observer to match skin state.
        syncControls(root, attachments);
        if (activeSkin()) {
          if (domObserver === null) {
            domObserver = new MutationObserver(scheduleSync);
            domObserver.observe(root, { childList: true, subtree: true });
          }
        } else if (domObserver !== null) {
          domObserver.disconnect();
          domObserver = null;
        }
      });
    };

    scheduleSync();

    const skinObserver = new MutationObserver(scheduleSync);
    skinObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-skin", "style"],
    });

    return () => {
      if (syncRaf !== 0) cancelAnimationFrame(syncRaf);
      skinObserver.disconnect();
      domObserver?.disconnect();
      domObserver = null;
      for (const [control, attachment] of attachments) {
        detachControl(control, attachment);
      }
      attachments.clear();
    };
  }, []);

  return null;
}
