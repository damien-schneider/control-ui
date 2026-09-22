import { beforeEach, describe, expect, test } from "bun:test";

import { resetGenerationLimits, takeGeneration } from "./generation-limit";

const withCookie = (cookie?: string) =>
  new Request("http://localhost/api/theme", {
    method: "POST",
    headers: cookie ? { cookie } : {},
  });

const cookieValue = (setCookie: string) => setCookie.split(";")[0] ?? "";

describe("takeGeneration", () => {
  beforeEach(resetGenerationLimits);

  test("walks a visitor through three generations, then refuses", () => {
    let cookie: string | undefined;

    for (let attempt = 1; attempt <= 3; attempt++) {
      const grant = takeGeneration(withCookie(cookie));
      expect(grant.granted).toBe(true);
      if (grant.granted) cookie = cookieValue(grant.cookie);
    }

    const refused = takeGeneration(withCookie(cookie));
    expect(refused.granted).toBe(false);
    if (!refused.granted) expect(refused.response.status).toBe(429);
  });

  test("keeps the tally out of reach of page scripts and other sites", () => {
    const grant = takeGeneration(withCookie());

    expect(grant.granted).toBe(true);
    if (grant.granted) {
      expect(grant.cookie).toContain("HttpOnly");
      expect(grant.cookie).toContain("SameSite=Lax");
    }
  });

  test("gives a visitor with no cookie a fresh allowance, which is the known bypass", () => {
    for (let attempt = 0; attempt < 3; attempt++) takeGeneration(withCookie("cui-theme-generations=3.99999999999999"));

    expect(takeGeneration(withCookie()).granted).toBe(true);
  });

  test("ignores a tally whose day has passed", () => {
    const expired = `cui-theme-generations=3.${Date.now() - 1000}`;

    expect(takeGeneration(withCookie(expired)).granted).toBe(true);
  });

  test("ignores a malformed tally rather than refusing forever", () => {
    expect(takeGeneration(withCookie("cui-theme-generations=nonsense")).granted).toBe(true);
  });
});
