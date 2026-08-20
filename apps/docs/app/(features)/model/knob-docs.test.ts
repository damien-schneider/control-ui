import { describe, expect, test } from "bun:test";
import { getDocsData } from "@/app/(features)/model/data";

const data = getDocsData();

describe("knob docs", () => {
  test("a page lists every family its installed recipes paint with", () => {
    const select = data.primitives.find((candidate) => candidate.id === "select");
    expect(select?.registry.knobs.map((family) => family.id)).toEqual(["button", "popup"]);
  });

  test("knobs carry the recipe root default and the registered syntax", () => {
    const composer = data.components.find((candidate) => candidate.id === "chat-composer");
    const radius = composer?.knobs.flatMap((family) => family.knobs).find((knob) => knob.name === "--chat-composer-shell-radius");
    expect(radius).toEqual({ name: "--chat-composer-shell-radius", syntax: "<length>", defaultValue: "var(--radius-field)" });
  });

  test("a family without knobs shows no section", () => {
    const actionBar = data.components.find((candidate) => candidate.id === "action-bar");
    expect(actionBar?.knobs).toEqual([]);
  });
});
