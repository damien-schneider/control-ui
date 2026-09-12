function parseLengthQuantity(value: string, rootFontSize: number) {
  const match = /^(-?\d*\.?\d+)(px|rem)?$/.exec(value.trim());
  if (!match) return null;
  return { amount: Number(match[1]) * (match[2] === "rem" ? rootFontSize : 1), unit: match[2] ? "px" : "" };
}

function calculateLengthExpression(expression: string, rootFontSize: number) {
  const match = /^\s*(-?\d*\.?\d+(?:px|rem)?)\s*([+*/-])\s*(-?\d*\.?\d+(?:px|rem)?)\s*$/.exec(expression);
  if (!match) return null;
  const left = parseLengthQuantity(match[1], rootFontSize);
  const right = parseLengthQuantity(match[3], rootFontSize);
  if (!left || !right) return null;
  const operator = match[2];
  if ((operator === "+" || operator === "-") && left.unit === right.unit) {
    return `${left.amount + (operator === "+" ? right.amount : -right.amount)}${left.unit}`;
  }
  if (operator === "*" && !(left.unit && right.unit)) return `${left.amount * right.amount}${left.unit || right.unit}`;
  const dividesByScalar = operator === "/" && !right.unit && right.amount !== 0;
  if (dividesByScalar) return `${left.amount / right.amount}${left.unit}`;
  return null;
}

export function emailLengthPixels(name: string, value: string, rootFontSize: number, allowZero = false): number {
  let resolved = value;
  for (let depth = 0; depth < 16 && resolved.includes("calc("); depth++) {
    const simplified = resolved.replace(
      /calc\(([^()]*)\)/g,
      (original, expression: string) => calculateLengthExpression(expression, rootFontSize) ?? original,
    );
    if (simplified === resolved) break;
    resolved = simplified;
  }
  const result = parseLengthQuantity(resolved, rootFontSize);
  const isLength = result && (result.unit === "px" || result.amount === 0);
  const isValidLength = isLength && Number.isFinite(result.amount) && (allowZero ? result.amount >= 0 : result.amount > 0);
  if (!isValidLength) {
    throw new Error(`Email theme: ${name} must resolve to a ${allowZero ? "non-negative" : "positive"} px/rem length, received ${value}.`);
  }
  return result.amount;
}
