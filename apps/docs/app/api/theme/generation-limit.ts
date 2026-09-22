const COOKIE_NAME = "cui-theme-generations";
export const PER_VISITOR_GENERATIONS = 10;
const DAY_MS = 24 * 60 * 60 * 1000;
const PER_INSTANCE_BURST = 60;

type Tally = { count: number; resetAt: number };

// A cookie is not a security control: clearing it, or opening a private window, buys a fresh allowance.
// It is still the best available signal — it follows the browser rather than an address, and it survives
// the cold starts and scale-outs that make any in-process per-visitor counter meaningless on Vercel.
// The hard ceiling on spend is the prepaid balance of the DeepSeek key, nothing here.
function readTally(request: Request, now: number): Tally {
  const cookie = request.headers.get("cookie");
  const match = cookie?.match(new RegExp(`${COOKIE_NAME}=(\\d+)\\.(\\d+)`));
  const resetAt = Number(match?.[2]);

  if (!match || !Number.isFinite(resetAt) || now >= resetAt) return { count: 0, resetAt: now + DAY_MS };
  return { count: Number(match[1]), resetAt };
}

function serializeTally({ count, resetAt }: Tally, now: number): string {
  const maxAge = Math.max(1, Math.round((resetAt - now) / 1000));
  return `${COOKIE_NAME}=${count}.${resetAt}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
}

// Per-instance and deliberately short: it blunts a burst against one warm lambda without pretending to be
// a daily budget. A distributed caller walks straight past it, which is what the prepaid balance is for.
let burst: Tally = { count: 0, resetAt: 0 };

const refuse = (message: string) => Response.json({ error: message }, { status: 429 });

export type GenerationGrant = { granted: true; cookie: string } | { granted: false; response: Response };

export function takeGeneration(request: Request): GenerationGrant {
  const now = Date.now();

  if (now >= burst.resetAt) burst = { count: 0, resetAt: now + 60_000 };
  if (burst.count >= PER_INSTANCE_BURST) {
    return { granted: false, response: refuse("Theme generation is busy right now. Try again in a minute.") };
  }

  const tally = readTally(request, now);
  if (tally.count >= PER_VISITOR_GENERATIONS) {
    return {
      granted: false,
      response: refuse(`You have used your ${PER_VISITOR_GENERATIONS} theme generations for today.`),
    };
  }

  burst.count += 1;
  return { granted: true, cookie: serializeTally({ count: tally.count + 1, resetAt: tally.resetAt }, now) };
}

export function resetGenerationLimits() {
  burst = { count: 0, resetAt: 0 };
}
