function qualityOf(mediaRange: string) {
  const quality = Number(/;\s*q=([\d.]+)/.exec(mediaRange)?.[1]);
  return Number.isFinite(quality) ? quality : 1;
}

export function prefersMarkdown(accept: string | null) {
  if (!accept?.includes("text/markdown")) return false;
  const ranges = accept.split(",");
  const markdown = ranges.find((range) => range.trimStart().startsWith("text/markdown"));
  const html = ranges.find((range) => range.trimStart().startsWith("text/html"));
  if (!markdown) return false;
  return qualityOf(markdown) > 0 && (!html || qualityOf(markdown) >= qualityOf(html));
}
