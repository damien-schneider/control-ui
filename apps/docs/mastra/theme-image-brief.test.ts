import { afterEach, expect, mock, test } from "bun:test";

import { describeImageReading, readImageBrief, type ThemeImageReading } from "./theme-image-brief";

const image = { mediaType: "image/png", data: "iVBORw0KGgo=" };

const wellFormed = {
  cornerShape: "rounded",
  radiusRem: 0.75,
  density: "airy",
  typeCharacter: "geometric-sans",
  headingWeight: 600,
  depth: "soft-shadow",
  note: "wide gutters, hairline rules, cards floating on an open grid",
};

const originalFetch = globalThis.fetch;

function answerWith(content: string, status = 200) {
  const respond = mock(async (): Promise<Response> => new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status }));
  globalThis.fetch = Object.assign(respond, { preconnect: originalFetch.preconnect });
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("a well-formed response parses into a typed reading", async () => {
  answerWith(JSON.stringify(wellFormed));

  expect(await readImageBrief(image)).toEqual({
    cornerShape: "rounded",
    radiusRem: 0.75,
    density: "airy",
    typeCharacter: "geometric-sans",
    headingWeight: 600,
    depth: "soft-shadow",
    note: "wide gutters, hairline rules, cards floating on an open grid",
  });
});

test("out-of-range numbers are clamped rather than rejected", async () => {
  answerWith(JSON.stringify({ ...wellFormed, radiusRem: 4.5, headingWeight: 1200 }));
  const high = await readImageBrief(image);
  expect(high.radiusRem).toBe(1.75);
  expect(high.headingWeight).toBe(900);

  answerWith(JSON.stringify({ ...wellFormed, radiusRem: -2, headingWeight: 100 }));
  const low = await readImageBrief(image);
  expect(low.radiusRem).toBe(0);
  expect(low.headingWeight).toBe(400);
});

test("an unrecognised enum value is unreadable", async () => {
  answerWith(JSON.stringify({ ...wellFormed, typeCharacter: "handwriting" }));

  await expect(readImageBrief(image)).rejects.toThrow("The image could not be read.");
});

test("a non-ok response is unreadable", async () => {
  answerWith(JSON.stringify(wellFormed), 503);

  await expect(readImageBrief(image)).rejects.toThrow("The image could not be read.");
});

test("a note running past twenty words is truncated", async () => {
  const overrun = Array.from({ length: 34 }, (_, index) => `word${index}`).join(" ");
  answerWith(JSON.stringify({ ...wellFormed, note: overrun }));

  const reading = await readImageBrief(image);
  expect(reading.note.split(" ")).toHaveLength(20);
  expect(reading.note.startsWith("word0 word1")).toBe(true);
  expect(reading.note).not.toContain("word20");
});

test("the reading renders as one line carrying radius, type character and note", () => {
  const reading: ThemeImageReading = {
    cornerShape: "pill",
    radiusRem: 1.5,
    density: "dense",
    typeCharacter: "slab-serif",
    headingWeight: 800,
    depth: "glassy",
    note: "tight rows over a blurred panel",
  };

  const line = describeImageReading(reading);
  expect(line).toContain("1.5rem");
  expect(line).toContain("slab serif");
  expect(line).toContain("tight rows over a blurred panel");
  expect(line.split("\n")).toHaveLength(1);
});
