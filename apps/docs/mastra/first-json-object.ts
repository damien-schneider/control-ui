function endOfJsonString(text: string, from: number): number {
  for (let index = from; index < text.length; index += 1) {
    if (text[index] === "\\") index += 1;
    else if (text[index] === '"') return index;
  }
  return text.length;
}

// A model that answers in prose around its object, or fences it, still answers. Scanning for the first
// balanced object is what makes a reply usable without a provider-enforced response format — which the
// tool-calling agents cannot have, because a native response format leaves them no turn to call a tool in.
export function firstJsonObject(text: string): unknown {
  const start = text.indexOf("{");
  if (start < 0) return null;

  let depth = 0;
  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') index = endOfJsonString(text, index + 1);
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth > 0) continue;
      try {
        return JSON.parse(text.slice(start, index + 1));
      } catch {
        return null;
      }
    }
  }

  return null;
}
