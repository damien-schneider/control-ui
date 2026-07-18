import { describe, expect, test } from "bun:test";

import { parseEnvironmentVariablesImportText } from "./use-environment-variables";

describe("parseEnvironmentVariablesImportText", () => {
  test("bulk mode accepts a single pasted assignment", () => {
    expect(parseEnvironmentVariablesImportText("api_key=secret", "bulk")).toEqual([{ key: "api_key", value: "secret" }]);
  });

  test("auto mode avoids intercepting ordinary lowercase value pastes in row inputs", () => {
    expect(parseEnvironmentVariablesImportText("token=partial", "auto")).toEqual([]);
    expect(parseEnvironmentVariablesImportText("API_KEY=secret", "auto")).toEqual([{ key: "API_KEY", value: "secret" }]);
  });
});
