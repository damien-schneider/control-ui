export const stripComments = (css) => css.replaceAll(/\/\*[\s\S]*?\*\//g, " ");

export function parseBlocks(css) {
  const blocks = [];
  let depth = 0;
  let preludeStart = 0;
  let bodyStart = 0;
  for (let index = 0; index < css.length; index += 1) {
    const character = css[index];
    if (character === "{") {
      if (depth === 0) bodyStart = index + 1;
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        blocks.push({ prelude: css.slice(preludeStart, bodyStart - 1).trim(), body: css.slice(bodyStart, index) });
        preludeStart = index + 1;
      }
    } else if (character === ";" && depth === 0) {
      preludeStart = index + 1;
    }
  }
  return blocks;
}

// @layer/@media/@supports wrap real blocks one level down; selector and @theme blocks hold declarations.
export function flattenBlocks(css) {
  return parseBlocks(css).flatMap((block) => (/^@(layer|media|supports)\b/.test(block.prelude) ? flattenBlocks(block.body) : [block]));
}

export function declarations(body) {
  const properties = new Map();
  let depth = 0;
  for (const statement of body.split(";")) {
    const open = (statement.match(/{/g) ?? []).length;
    const close = (statement.match(/}/g) ?? []).length;
    if (depth === 0) {
      const match = /^\s*(--[\w-]+)\s*:\s*([\s\S]*)$/.exec(statement);
      if (match) properties.set(match[1], match[2].trim());
    }
    depth += open - close;
  }
  return properties;
}

const declaresTokens = (prelude) => prelude.includes("[data-skin") || (prelude.startsWith("@theme") && !prelude.includes("inline"));

function modesOf(prelude) {
  if (/\.dark\b/.test(prelude.replaceAll(/:not\([^)]*\)/g, ""))) return ["dark"];
  if (/:not\([^)]*\.dark\b/.test(prelude)) return ["light"];
  return ["light", "dark"];
}

/** Later source wins, so the order is Tailwind palette, core theme, skin theme, app overrides. */
export function tokenMaps(cssSources) {
  const maps = { light: new Map(), dark: new Map() };
  for (const css of cssSources) {
    for (const block of flattenBlocks(stripComments(css))) {
      if (!declaresTokens(block.prelude)) continue;
      const modes = modesOf(block.prelude);
      for (const [name, value] of declarations(block.body)) {
        for (const mode of modes) maps[mode].set(name, value);
      }
    }
  }
  return maps;
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function rgbToOklch(r255, g255, b255) {
  const r = srgbToLinear(clamp(r255, 0, 255) / 255);
  const g = srgbToLinear(clamp(g255, 0, 255) / 255);
  const b = srgbToLinear(clamp(b255, 0, 255) / 255);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.hypot(A, B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

export function oklchToRgb(L, C, H) {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const to = (c) => clamp(Math.round(linearToSrgb(c) * 255), 0, 255);
  return { r: to(r), g: to(g), b: to(bl) };
}

const channelLuminance = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export const luminance = ({ r, g, b }) => 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);

export function contrastRatio(a, b) {
  const la = luminance(a) + 0.05;
  const lb = luminance(b) + 0.05;
  return la > lb ? la / lb : lb / la;
}

export function parseHex(value) {
  const match = /^#([0-9a-f]{3,8})$/i.exec(value);
  if (!match) return null;
  const digits = match[1];
  const expand = (pair) => Number.parseInt(pair.length === 1 ? pair + pair : pair, 16);
  const step = digits.length <= 4 ? 1 : 2;
  if (digits.length !== 3 && digits.length !== 4 && digits.length !== 6 && digits.length !== 8) return null;
  const at = (index) => digits.slice(index * step, index * step + step);
  const alphaDigits = digits.length === 4 || digits.length === 8 ? at(3) : null;
  return { r: expand(at(0)), g: expand(at(1)), b: expand(at(2)), alpha: alphaDigits === null ? 1 : expand(alphaDigits) / 255 };
}

const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)$/;

function scalar(text) {
  const trimmed = text.trim();
  if (trimmed.endsWith("%")) {
    const percent = trimmed.slice(0, -1);
    return NUMBER.test(percent) ? Number(percent) / 100 : null;
  }
  return NUMBER.test(trimmed) ? Number(trimmed) : null;
}

function splitTopLevel(text) {
  const parts = [];
  let depth = 0;
  let current = "";
  const flush = () => {
    if (current) parts.push(current);
    current = "";
  };
  for (const character of text) {
    if (character === "(") depth += 1;
    else if (character === ")") depth -= 1;
    if (depth > 0 || !/[\s/]/.test(character)) {
      current += character;
      continue;
    }
    flush();
    if (character === "/") parts.push("/");
  }
  flush();
  return parts;
}

const unresolved = (reason) => ({ unresolved: reason });
const isUnresolved = (result) => Boolean(result?.unresolved);

/** `calc(<base> <op> <n>)`, `calc(<n> * var(--x))` and `calc(<base> * <n>)` — the only calc shapes the packs write. */
function evaluateCalc(expression, base, tokens, seen, depth) {
  const inner = expression.slice(5, -1).trim();
  const match = /^(\S+)\s*([+\-*])\s*(\S+)$/.exec(inner);
  if (!match) return null;
  const [, leftText, operator, rightText] = match;
  const operand = (text) => {
    if (text === "l" || text === "alpha") return base;
    const number = scalar(text);
    if (number !== null) return number;
    const nested = resolveScalar(text, tokens, seen, depth + 1);
    return typeof nested === "number" ? nested : null;
  };
  const left = operand(leftText);
  const right = operand(rightText);
  if (left === null || right === null) return null;
  if (operator === "+") return left + right;
  if (operator === "-") return left - right;
  return left * right;
}

function resolveScalar(value, tokens, seen, depth) {
  const trimmed = value.trim();
  const number = scalar(trimmed);
  if (number !== null) return number;
  const variable = /^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/.exec(trimmed);
  if (variable) {
    if (depth > 16 || seen.has(variable[1])) return null;
    const declared = tokens.get(variable[1]) ?? variable[2];
    if (declared === undefined) return null;
    return resolveScalar(declared, tokens, new Set([...seen, variable[1]]), depth + 1);
  }
  return null;
}

// Only lightness takes a percentage; a `%` anywhere else is a grammar this engine will not guess at.
const literalChannel = (text, allowPercent) => (allowPercent || !text.endsWith("%") ? scalar(text) : null);

const channelValue = (text, keyword, base, tokens, seen, depth) => {
  if (text === keyword) return base;
  if (text.startsWith("calc(")) return evaluateCalc(text, base, tokens, seen, depth);
  return literalChannel(text, keyword === "l");
};

const alphaValue = (text, base, tokens, seen, depth) =>
  text.startsWith("calc(") ? evaluateCalc(text, base, tokens, seen, depth) : resolveScalar(text, tokens, seen, depth);

const CHANNEL_KEYWORDS = ["l", "c", "h"];

function relativeOklch(inner, tokens, seen, depth) {
  const parts = splitTopLevel(inner.slice(5).trim());
  const slash = parts.indexOf("/");
  const channels = slash === -1 ? parts : parts.slice(0, slash);
  if (channels.length !== 4) return unresolved(`unsupported relative color \`oklch(${inner})\``);
  const base = resolveColor(channels[0], tokens, seen, depth + 1);
  if (isUnresolved(base)) return base;
  const { L, C, H } = rgbToOklch(base.r, base.g, base.b);
  const resolved = CHANNEL_KEYWORDS.map((keyword, index) =>
    channelValue(channels[index + 1], keyword, [L, C, H][index], tokens, seen, depth),
  );
  if (resolved.some((value) => value === null)) return unresolved(`unsupported channel in \`oklch(${inner})\``);
  const alphaText = slash === -1 ? null : parts.slice(slash + 1).join(" ");
  const alpha = alphaText === null ? base.alpha : alphaValue(alphaText, base.alpha, tokens, seen, depth);
  if (alpha === null) return unresolved(`unsupported alpha \`${alphaText}\``);
  return { ...oklchToRgb(resolved[0], resolved[1], resolved[2]), alpha: clamp(alpha, 0, 1) };
}

function literalOklch(inner, tokens, seen, depth) {
  const parts = splitTopLevel(inner);
  const slash = parts.indexOf("/");
  const channels = slash === -1 ? parts : parts.slice(0, slash);
  if (channels.length !== 3) return unresolved(`unsupported \`oklch(${inner})\``);
  const numbers = channels.map((part, index) => literalChannel(part, index === 0));
  if (numbers.some((number) => number === null)) return unresolved(`unsupported \`oklch(${inner})\``);
  const alphaText = slash === -1 ? null : parts.slice(slash + 1).join(" ");
  const alpha = alphaText === null ? 1 : resolveScalar(alphaText, tokens, seen, depth);
  if (alpha === null) return unresolved(`unsupported alpha in \`oklch(${inner})\``);
  return { ...oklchToRgb(numbers[0], numbers[1], numbers[2]), alpha: clamp(alpha, 0, 1) };
}

export function resolveColor(value, tokens, seen = new Set(), depth = 0) {
  const trimmed = String(value ?? "").trim();
  if (depth > 16) return unresolved("token chain deeper than 16 hops");
  if (trimmed === "") return unresolved("empty value");
  if (trimmed === "transparent") return { r: 0, g: 0, b: 0, alpha: 0 };
  const hex = parseHex(trimmed);
  if (hex) return hex;
  const variable = /^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/.exec(trimmed);
  if (variable) {
    if (seen.has(variable[1])) return unresolved(`\`${variable[1]}\` refers to itself`);
    const declared = tokens.get(variable[1]) ?? variable[2];
    if (declared === undefined) return unresolved(`\`${variable[1]}\` is declared by nobody`);
    return resolveColor(declared, tokens, new Set([...seen, variable[1]]), depth + 1);
  }
  const oklch = /^oklch\(([\s\S]*)\)$/.exec(trimmed);
  if (oklch) {
    const inner = oklch[1].trim();
    return inner.startsWith("from ") ? relativeOklch(inner, tokens, seen, depth) : literalOklch(inner, tokens, seen, depth);
  }
  return unresolved(`unsupported value \`${trimmed}\``);
}

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

export function composite(over, under) {
  const alpha = over.alpha + under.alpha * (1 - over.alpha);
  if (alpha === 0) return { r: 0, g: 0, b: 0, alpha: 0 };
  const channel = (key) => (over[key] * over.alpha + under[key] * under.alpha * (1 - over.alpha)) / alpha;
  return { r: channel("r"), g: channel("g"), b: channel("b"), alpha };
}

export function evaluatePair(pair, tokens) {
  const layers = [...(pair.underlays ?? []), pair.surface, pair.background, pair.foreground];
  let stack = WHITE;
  let backdrop = WHITE;
  for (const [index, token] of layers.entries()) {
    const resolved = resolveColor(`var(${token})`, tokens);
    if (isUnresolved(resolved)) return { ...pair, ratio: null, status: "unverified", reason: `${token}: ${resolved.unresolved}` };
    if (index === layers.length - 1) backdrop = stack;
    stack = composite(resolved, stack);
  }
  const ratio = contrastRatio(stack, backdrop);
  return { ...pair, ratio, status: ratio >= pair.threshold ? "pass" : "fail", reason: null };
}

export function evaluate(tokens, pairs) {
  return pairs.map((pair) => evaluatePair(pair, tokens));
}
