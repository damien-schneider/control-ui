"use client";

import { useEffect } from "react";
import {
  type AppleLiquidGlassCapture,
  type AppleLiquidGlassEngine,
  type AppleLiquidGlassProfile,
  type AppleLiquidGlassSurface,
  captureAppleLiquidGlassBackdrop,
  createAppleLiquidGlassEngine,
} from "./modern-apple-liquid-glass";

export const appleLiquidGlassSurfaceSelector =
  '[data-control-ui][data-slot][data-surface="floating"], [data-control-ui][data-slot][data-surface="modal"]';
const captureExcludeSelector = '[data-apple-liquid-glass-capture-excluded], [data-control-ui="dynamic-notification"][data-slot="root"]';

type Attachment = AppleLiquidGlassSurface & {
  capture: AppleLiquidGlassCapture | null;
  failures: number;
  geometry: string;
  intersecting: boolean;
  previousStyle: {
    isolation: string;
    position: string;
  };
};

type UnsupportedReason = "unsupported-canvas" | "unsupported-raster" | "unsupported-render" | "unsupported-webgl";

function activeSkin(): boolean {
  return document.documentElement.dataset.skin === "modern-apple";
}

function modernAppleScope(surface: HTMLElement): boolean {
  return surface.closest<HTMLElement>("[data-skin]")?.dataset.skin === "modern-apple";
}

function surfaceProfile(surface: HTMLElement): AppleLiquidGlassProfile {
  return surface.dataset.surface === "modal" ? "modal" : "regular";
}

function createSurfaceCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.extensionNode = "modern-apple-liquid-glass";
  Object.assign(canvas.style, {
    display: "block",
    left: "0",
    opacity: "0",
    pointerEvents: "none",
    position: "absolute",
    top: "0",
    transformOrigin: "top left",
    zIndex: "-1",
  });
  canvas.style.setProperty("border-radius", "inherit");
  canvas.style.setProperty("corner-shape", "inherit");
  return canvas;
}

function primeSurface(surface: HTMLElement): Attachment["previousStyle"] {
  const previousStyle = {
    isolation: surface.style.isolation,
    position: surface.style.position,
  };
  if (getComputedStyle(surface).position === "static") surface.style.position = "relative";
  surface.style.isolation = "isolate";
  return previousStyle;
}

function restoreSurface(surface: HTMLElement, previousStyle: Attachment["previousStyle"]): void {
  surface.style.isolation = previousStyle.isolation;
  surface.style.position = previousStyle.position;
}

function syncCanvasScroll(attachment: Attachment): void {
  attachment.canvas.style.transform = `translate3d(${attachment.host.scrollLeft}px, ${attachment.host.scrollTop}px, 0)`;
}

function clearReadyState(attachment: Attachment): void {
  attachment.canvas.style.opacity = "0";
  delete attachment.host.dataset.appleLiquidGlassReady;
}

function markReady(attachment: Attachment): void {
  attachment.canvas.style.opacity = "1";
  attachment.host.dataset.appleLiquidGlassReady = "true";
}

function geometryKey(host: HTMLElement): string {
  const rect = host.getBoundingClientRect();
  return [rect.left, rect.top, rect.width, rect.height].map((value) => Math.round(value * 4) / 4).join(":");
}

function captureContains(capture: AppleLiquidGlassCapture, attachment: Attachment): boolean {
  const right = capture.region.left + capture.region.width;
  const bottom = capture.region.top + capture.region.height;
  const rect = attachment.host.getBoundingClientRect();
  return rect.left >= capture.region.left && rect.top >= capture.region.top && rect.right <= right && rect.bottom <= bottom;
}

function movedAttachments(attachments: readonly Attachment[]): Attachment[] {
  return attachments.filter((attachment) => {
    const nextGeometry = geometryKey(attachment.host);
    if (nextGeometry === attachment.geometry) return false;
    attachment.geometry = nextGeometry;
    syncCanvasScroll(attachment);
    return true;
  });
}

function renderCachedCapture(engine: AppleLiquidGlassEngine, attachment: Attachment): boolean {
  if (!attachment.capture || !captureContains(attachment.capture, attachment)) return false;
  if (!engine.render(attachment.capture, [attachment])) return false;
  markReady(attachment);
  return true;
}

function surfaceStackLevel(host: HTMLElement): number {
  let level = 0;
  for (let element: HTMLElement | null = host; element; element = element.parentElement) {
    const zIndex = Number.parseInt(getComputedStyle(element).zIndex, 10);
    if (Number.isFinite(zIndex)) level = Math.max(level, zIndex);
  }
  return level;
}

function compareSurfaceStack(a: Attachment, b: Attachment): number {
  const levelDifference = surfaceStackLevel(a.host) - surfaceStackLevel(b.host);
  if (levelDifference !== 0) return levelDifference;
  return a.host.compareDocumentPosition(b.host) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

export function ModernAppleLiquidGlassRuntime() {
  useEffect(() => {
    const root = document.body;
    const attachments = new Map<HTMLElement, Attachment>();
    let engine: AppleLiquidGlassEngine | null = null;
    let engineUnavailable = false;
    let syncFrame = 0;
    let captureTimer = 0;
    let captureToken = 0;
    let captureRunning = false;
    let captureQueued = false;
    let domObserver: MutationObserver | null = null;
    let disposed = false;
    let geometryFrame = 0;
    let geometryMonitorUntil = 0;

    const scheduleCapture = (delay = 48) => {
      if (disposed) return;
      if (captureRunning) {
        captureQueued = true;
        return;
      }
      window.clearTimeout(captureTimer);
      captureTimer = window.setTimeout(() => {
        captureTimer = 0;
        void recapture();
      }, delay);
    };

    const handleContextState = (available: boolean) => {
      if (!available) {
        for (const attachment of attachments.values()) clearReadyState(attachment);
        return;
      }
      scheduleCapture(0);
    };

    const ensureEngine = (): AppleLiquidGlassEngine | null => {
      if (disposed) return null;
      if (engine) return engine;
      if (engineUnavailable) return null;
      engine = createAppleLiquidGlassEngine(handleContextState);
      if (!engine) engineUnavailable = true;
      return engine;
    };

    const resizeObserver = new ResizeObserver(() => scheduleCapture(80));
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!(entry.target instanceof HTMLElement)) continue;
          const attachment = attachments.get(entry.target);
          if (attachment) attachment.intersecting = entry.isIntersecting;
        }
        scheduleCapture(80);
      },
      { rootMargin: "96px" },
    );

    const handleSurfaceScroll = (event: Event) => {
      if (!(event.currentTarget instanceof HTMLElement)) return;
      const attachment = attachments.get(event.currentTarget);
      if (attachment) syncCanvasScroll(attachment);
    };

    const attachSurface = (surface: HTMLElement): boolean => {
      if (attachments.has(surface) || surface.dataset.appleLiquidGlass?.startsWith("unsupported")) return false;
      const activeEngine = ensureEngine();
      if (!activeEngine) {
        surface.dataset.appleLiquidGlass = "unsupported-webgl";
        return false;
      }
      const canvas = createSurfaceCanvas();
      if (!canvas.getContext("2d")) {
        surface.dataset.appleLiquidGlass = "unsupported-canvas";
        return false;
      }
      const previousStyle = primeSurface(surface);
      const attachment: Attachment = {
        canvas,
        capture: null,
        failures: 0,
        geometry: geometryKey(surface),
        host: surface,
        intersecting: true,
        previousStyle,
        profile: surfaceProfile(surface),
      };
      surface.dataset.appleLiquidGlass = "active";
      surface.dataset.appleLiquidGlassProfile = attachment.profile;
      surface.prepend(canvas);
      syncCanvasScroll(attachment);
      surface.addEventListener("scroll", handleSurfaceScroll, { passive: true });
      resizeObserver.observe(surface);
      intersectionObserver.observe(surface);
      attachments.set(surface, attachment);
      return true;
    };

    const detachSurface = (surface: HTMLElement, attachment: Attachment, unsupported?: UnsupportedReason): void => {
      resizeObserver.unobserve(surface);
      intersectionObserver.unobserve(surface);
      surface.removeEventListener("scroll", handleSurfaceScroll);
      attachment.canvas.remove();
      restoreSurface(surface, attachment.previousStyle);
      delete surface.dataset.appleLiquidGlassCaptureExcluded;
      delete surface.dataset.appleLiquidGlassReady;
      delete surface.dataset.appleLiquidGlassProfile;
      if (unsupported) surface.dataset.appleLiquidGlass = unsupported;
      else delete surface.dataset.appleLiquidGlass;
    };

    const stopEngine = () => {
      engine?.destroy();
      engine = null;
      engineUnavailable = false;
    };

    const deactivateSurfaces = (): boolean => {
      const changed = attachments.size > 0 || engine !== null;
      captureToken += 1;
      for (const [surface, attachment] of attachments) detachSurface(surface, attachment);
      attachments.clear();
      for (const surface of root.querySelectorAll<HTMLElement>('[data-apple-liquid-glass^="unsupported"]')) {
        delete surface.dataset.appleLiquidGlass;
      }
      stopEngine();
      return changed;
    };

    const attachEligibleSurfaces = (): boolean => {
      let changed = false;
      for (const surface of root.querySelectorAll<HTMLElement>(appleLiquidGlassSurfaceSelector)) {
        if (modernAppleScope(surface)) changed = attachSurface(surface) || changed;
      }
      return changed;
    };

    const detachStaleSurfaces = (): boolean => {
      let changed = false;
      for (const [surface, attachment] of attachments) {
        const stale = !root.contains(surface) || !surface.matches(appleLiquidGlassSurfaceSelector) || !modernAppleScope(surface);
        if (stale) {
          detachSurface(surface, attachment);
          attachments.delete(surface);
          changed = true;
          continue;
        }
        attachment.profile = surfaceProfile(surface);
        surface.dataset.appleLiquidGlassProfile = attachment.profile;
        syncCanvasScroll(attachment);
      }
      return changed;
    };

    const syncSurfaces = (): boolean => {
      if (!activeSkin()) return deactivateSurfaces();
      const attached = attachEligibleSurfaces();
      return detachStaleSurfaces() || attached;
    };

    const visibleAttachments = (): Attachment[] =>
      [...attachments.values()].filter(
        (attachment) =>
          attachment.intersecting && root.contains(attachment.host) && attachment.host.clientWidth > 0 && attachment.host.clientHeight > 0,
      );

    const handleCaptureFailure = (visible: readonly Attachment[], reason: UnsupportedReason) => {
      let retry = false;
      for (const attachment of visible) {
        attachment.failures += 1;
        if (attachment.failures < 3) {
          retry = true;
          continue;
        }
        clearReadyState(attachment);
        detachSurface(attachment.host, attachment, reason);
        attachments.delete(attachment.host);
      }
      if (retry) scheduleCapture(120);
    };

    const handleCaptureSuccess = (visible: readonly Attachment[]) => {
      for (const attachment of visible) {
        attachment.failures = 0;
        markReady(attachment);
      }
    };

    const captureContext = (): { activeEngine: AppleLiquidGlassEngine; visible: Attachment[] } | null => {
      const visible = visibleAttachments();
      if (!activeSkin() || visible.length === 0) return null;
      const activeEngine = ensureEngine();
      return activeEngine && visible.length > 0 ? { activeEngine, visible } : null;
    };

    const finishCapture = (
      activeEngine: AppleLiquidGlassEngine,
      capture: Awaited<ReturnType<typeof captureAppleLiquidGlassBackdrop>>,
      visible: readonly Attachment[],
    ) => {
      if (!capture) {
        handleCaptureFailure(visible, "unsupported-raster");
        return;
      }
      if (activeEngine.render(capture, visible)) {
        for (const attachment of visible) attachment.capture = capture;
        handleCaptureSuccess(visible);
      } else handleCaptureFailure(visible, "unsupported-render");
    };

    const captureAttachment = async (activeEngine: AppleLiquidGlassEngine, attachment: Attachment, token: number) => {
      const capture = await captureAppleLiquidGlassBackdrop([attachment.host], {
        excludeSelector: captureExcludeSelector,
        maxTextureSize: activeEngine.maxTextureSize,
      });
      if (token !== captureToken || !activeSkin()) return false;
      finishCapture(activeEngine, capture, [attachment]);
      delete attachment.host.dataset.appleLiquidGlassCaptureExcluded;
      return true;
    };

    const setCaptureExclusion = (excluded: boolean) => {
      for (const attachment of attachments.values()) {
        if (excluded) attachment.host.dataset.appleLiquidGlassCaptureExcluded = "true";
        else delete attachment.host.dataset.appleLiquidGlassCaptureExcluded;
      }
    };

    const captureStack = async (activeEngine: AppleLiquidGlassEngine, ordered: readonly Attachment[], token: number) => {
      for (const attachment of ordered) {
        if (!(await captureAttachment(activeEngine, attachment, token))) return;
      }
    };

    async function performCapture(): Promise<void> {
      const context = captureContext();
      if (!context) return;

      captureToken += 1;
      const token = captureToken;
      const ordered = [...context.visible].sort(compareSurfaceStack);
      setCaptureExclusion(true);
      await captureStack(context.activeEngine, ordered, token).finally(() => {
        setCaptureExclusion(false);
      });
    }

    async function recapture(): Promise<void> {
      if (disposed) return;
      if (captureRunning) {
        captureQueued = true;
        return;
      }
      captureRunning = true;
      await performCapture().finally(() => {
        captureRunning = false;
        if (captureQueued) {
          captureQueued = false;
          scheduleCapture(80);
        }
      });
    }

    const monitorGeometry = () => {
      geometryFrame = 0;
      if (disposed || !activeSkin() || attachments.size === 0) return;
      const moved = movedAttachments(visibleAttachments());
      const activeEngine = engine;
      const rendered = activeEngine ? moved.map((attachment) => renderCachedCapture(activeEngine, attachment)) : [];
      if (moved.length > 0 && (rendered.length !== moved.length || rendered.includes(false))) scheduleCapture(0);
      if (performance.now() < geometryMonitorUntil) geometryFrame = requestAnimationFrame(monitorGeometry);
    };

    const monitorSurfaceGeometry = (duration = 600) => {
      geometryMonitorUntil = Math.max(geometryMonitorUntil, performance.now() + duration);
      if (geometryFrame === 0 && attachments.size > 0) geometryFrame = requestAnimationFrame(monitorGeometry);
    };

    const handleSurfaceMotion = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const surface = event.target.closest<HTMLElement>(appleLiquidGlassSurfaceSelector);
      if (surface && attachments.has(surface)) monitorSurfaceGeometry(1200);
    };

    const handleDomMutations = () => {
      scheduleSync();
    };

    const syncDomObserver = () => {
      if (activeSkin() && !domObserver) {
        domObserver = new MutationObserver(handleDomMutations);
        domObserver.observe(root, { childList: true, subtree: true });
        return;
      }
      if (!activeSkin() && domObserver) {
        domObserver.disconnect();
        domObserver = null;
      }
    };

    const performSync = () => {
      syncFrame = 0;
      const changed = syncSurfaces();
      syncDomObserver();
      if (changed && activeSkin()) {
        monitorSurfaceGeometry();
        scheduleCapture(80);
      }
    };

    const scheduleSync = () => {
      if (syncFrame !== 0) return;
      syncFrame = requestAnimationFrame(performSync);
    };

    const handleViewportScroll = (event: Event) => {
      if (event.target instanceof HTMLElement && attachments.has(event.target)) return;
      monitorSurfaceGeometry(240);
      scheduleCapture(32);
    };
    const handleViewportResize = () => scheduleCapture(32);
    const handleLoadedAsset = () => scheduleCapture(0);

    scheduleSync();
    const skinObserver = new MutationObserver(() => {
      scheduleSync();
      scheduleCapture(0);
    });
    skinObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-motion", "data-skin", "style"],
    });
    document.addEventListener("scroll", handleViewportScroll, true);
    root.addEventListener("animationstart", handleSurfaceMotion, true);
    window.addEventListener("resize", handleViewportResize, { passive: true });
    root.addEventListener("load", handleLoadedAsset, true);
    root.addEventListener("transitionrun", handleSurfaceMotion, true);
    void document.fonts?.ready.then(handleLoadedAsset);

    return () => {
      disposed = true;
      captureToken += 1;
      if (syncFrame !== 0) cancelAnimationFrame(syncFrame);
      if (geometryFrame !== 0) cancelAnimationFrame(geometryFrame);
      window.clearTimeout(captureTimer);
      skinObserver.disconnect();
      domObserver?.disconnect();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("scroll", handleViewportScroll, true);
      root.removeEventListener("animationstart", handleSurfaceMotion, true);
      window.removeEventListener("resize", handleViewportResize);
      root.removeEventListener("load", handleLoadedAsset, true);
      root.removeEventListener("transitionrun", handleSurfaceMotion, true);
      for (const [surface, attachment] of attachments) detachSurface(surface, attachment);
      attachments.clear();
      stopEngine();
    };
  }, []);

  return null;
}
