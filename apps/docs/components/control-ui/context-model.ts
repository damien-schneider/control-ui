import type { ContextSegment, ContextSegmentKind, ContextStatus } from "@/components/control-ui/contracts";

export type ContextModelSegment = {
  segment: ContextSegment;
  kind: ContextSegmentKind;
  tokens: number;
  start: number;
  width: number;
  ratio: number | null;
};

export type ContextModel = {
  segments: readonly ContextModelSegment[];
  usedTokens: number;
  maxTokens: number | null;
  remainingTokens: number | null;
  overageTokens: number;
  ratio: number | null;
  domain: number;
  limitPosition: number | null;
  status: ContextStatus;
};

function deriveContextModelSegments(segments: readonly ContextSegment[], domain: number, validLimit: number | null): ContextModelSegment[] {
  let consumedTokens = 0;
  return segments.map((segment) => {
    const tokens = Number.isFinite(segment.tokens) && segment.tokens > 0 ? segment.tokens : 0;
    const modelSegment = {
      segment,
      kind: segment.kind ?? "other",
      tokens,
      start: (consumedTokens / domain) * 100,
      width: (tokens / domain) * 100,
      ratio: validLimit === null ? null : tokens / validLimit,
    } satisfies ContextModelSegment;
    consumedTokens += tokens;
    return modelSegment;
  });
}

function deriveValidatedUsedTokens(segments: readonly ContextSegment[]): number {
  const ids = new Set<string>();
  let usedTokens = 0;
  for (const segment of segments) {
    if (ids.has(segment.id)) throw new Error(`Context segment ids must be unique: "${segment.id}".`);
    ids.add(segment.id);
    usedTokens += Number.isFinite(segment.tokens) && segment.tokens > 0 ? segment.tokens : 0;
  }
  return usedTokens;
}

export function deriveContextModel(segments: readonly ContextSegment[], maxTokens?: number | null): ContextModel {
  const usedTokens = deriveValidatedUsedTokens(segments);

  const validLimit = Number.isFinite(maxTokens) && (maxTokens ?? 0) > 0 ? (maxTokens ?? null) : null;
  const domain = Math.max(validLimit ?? 0, usedTokens, 1);
  const remainingTokens = validLimit === null ? null : Math.max(0, validLimit - usedTokens);
  const overageTokens = validLimit === null ? 0 : Math.max(0, usedTokens - validLimit);
  const ratio = validLimit === null ? null : usedTokens / validLimit;
  const limitPosition = validLimit === null ? null : (validLimit / domain) * 100;
  let status: ContextStatus = "normal";
  if (validLimit === null) status = "unavailable";
  else if (overageTokens > 0) status = "over-limit";
  const modelSegments = deriveContextModelSegments(segments, domain, validLimit);

  return {
    segments: modelSegments,
    usedTokens,
    maxTokens: validLimit,
    remainingTokens,
    overageTokens,
    ratio,
    domain,
    limitPosition,
    status,
  } satisfies ContextModel;
}
