"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { SkinMetaId, SourceFile } from "@/app/(features)/model/types";
import { THEME_CONTRACT } from "@/src/registry/lib/theme-contract";
import { cssColorToHexDom } from "./color-utils";

export type SkinSourceState = { status: "loading" } | { status: "error" } | { status: "ready"; files: SourceFile[] };

// Shared across every consumer (source tab + default-skin diff) so one skin loads once per session and retries stay consistent.
const entries = new Map<SkinMetaId, { state: SkinSourceState }>();
const inflight = new Map<SkinMetaId, Promise<void>>();
const listeners = new Set<() => void>();
const LOADING: { state: SkinSourceState } = { state: { status: "loading" } };

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readSourceFile(value: unknown): SourceFile | null {
  if (!isRecord(value) || typeof value.label !== "string" || typeof value.path !== "string" || typeof value.code !== "string") return null;
  if (value.slot !== undefined && typeof value.slot !== "string") return null;
  return { label: value.label, path: value.path, code: value.code, slot: value.slot };
}

function readCoreSkinFiles(payload: unknown): SourceFile[] | null {
  if (!isRecord(payload) || payload.type !== "item" || !isRecord(payload.data) || !Array.isArray(payload.data.files)) return null;

  const files = payload.data.files.map(readSourceFile);
  if (files.some((file) => file === null)) return null;

  return files.filter(
    (file): file is SourceFile => file !== null && (file.slot === "theme" || file.slot === "skin" || file.slot === "config"),
  );
}

async function fetchCoreSkinFiles(skin: SkinMetaId, bypassCache: boolean) {
  const response = await fetch(`/api/registry/${skin}`, { cache: bypassCache ? "no-store" : "default" });
  if (!response.ok) throw new Error("Source request failed");

  const files = readCoreSkinFiles(await response.json());
  if (!files || files.length === 0) throw new Error("Source response was invalid");
  return files;
}

function requestSource(skin: SkinMetaId, bypassCache: boolean) {
  const pending = inflight.get(skin);
  if (pending && !bypassCache) return pending;
  entries.set(skin, { state: { status: "loading" } });
  emit();
  const promise = fetchCoreSkinFiles(skin, bypassCache)
    .then((files) => {
      entries.set(skin, { state: { status: "ready", files } });
    })
    .catch(() => {
      entries.set(skin, { state: { status: "error" } });
    })
    .finally(() => {
      inflight.delete(skin);
      emit();
    });
  inflight.set(skin, promise);
  return promise;
}

export function useSkinSource(skin: SkinMetaId) {
  const entry = useSyncExternalStore(
    subscribe,
    () => entries.get(skin) ?? LOADING,
    () => LOADING,
  );

  useEffect(() => {
    if (!entries.has(skin)) void requestSource(skin, false);
  }, [skin]);

  return {
    source: entry.state,
    retry: () => void requestSource(skin, true),
  };
}

export function themeFile(files: SourceFile[]): SourceFile | null {
  return files.find((file) => file.slot === "theme") ?? null;
}

export type ParsedSkinTheme = {
  light: Map<string, string>;
  dark: Map<string, string>;
};

const parseCache = new Map<string, ParsedSkinTheme>();

// Flat custom-property blocks only — theme packs never nest braces or wrap contract tokens in @media.
export function parseSkinTheme(code: string): ParsedSkinTheme {
  const cached = parseCache.get(code);
  if (cached) return cached;

  const light = new Map<string, string>();
  const dark = new Map<string, string>();
  const withoutComments = code.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const [, selectorText, body] of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const scope = /(^|[\s,>+~(])\.dark\b/.test(selectorText.trim()) ? dark : light;
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      scope.set(name, value.trim().replace(/\s+/g, " "));
    }
  }

  const parsed = { light, dark };
  parseCache.set(code, parsed);
  return parsed;
}

function sameCssValue(a: string, b: string): boolean {
  if (a === b) return true;
  // authored formats drift (oklch vs hex); DOM resolution compares what the browser actually paints
  const hexA = cssColorToHexDom(a);
  return hexA !== null && hexA === cssColorToHexDom(b);
}

/** Contract tokens whose current-mode value the active skin authors differently than the base theme. */
export function skinChangedTokenNames(active: ParsedSkinTheme, base: ParsedSkinTheme, dark: boolean): ReadonlySet<string> {
  const activeScope = dark ? active.dark : active.light;
  const baseScope = dark ? base.dark : base.light;
  const changed = new Set<string>();
  for (const token of THEME_CONTRACT) {
    const activeValue = activeScope.get(token.name);
    const baseValue = baseScope.get(token.name);
    if (!activeValue || !baseValue) continue;
    if (!sameCssValue(activeValue, baseValue)) changed.add(token.name);
  }
  return changed;
}
