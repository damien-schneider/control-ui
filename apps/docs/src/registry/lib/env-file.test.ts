import { describe, expect, test } from "bun:test";

import { collectEnvironmentVariables, DuplicateEnvironmentVariableKeyError, parseEnvFileText, rowsToEnvFileText } from "./env-file";

describe("env-file helpers", () => {
  test("parses common .env syntax", () => {
    expect(
      parseEnvFileText(
        [
          "# local",
          "OPENAI_API_KEY=sk-test",
          "export DATABASE_URL=postgres://localhost/db",
          "EQUALS=one=two",
          "INLINE=keep # remove this",
          'PRIVATE_KEY="line one\\nline two"',
        ].join("\n"),
      ),
    ).toEqual([
      { key: "OPENAI_API_KEY", value: "sk-test" },
      { key: "DATABASE_URL", value: "postgres://localhost/db" },
      { key: "EQUALS", value: "one=two" },
      { key: "INLINE", value: "keep" },
      { key: "PRIVATE_KEY", value: "line one\nline two" },
    ]);
  });

  test("collects rows and rejects duplicate keys", () => {
    expect(
      collectEnvironmentVariables([
        { key: "API_KEY", value: "one" },
        { key: "EMPTY", value: "" },
        { key: "", value: "ignored" },
      ]),
    ).toEqual({ API_KEY: "one", EMPTY: "" });

    expect(() =>
      collectEnvironmentVariables([
        { key: "API_KEY", value: "one" },
        { key: "API_KEY", value: "two" },
      ]),
    ).toThrow(DuplicateEnvironmentVariableKeyError);
  });

  test("serializes values that need quoting", () => {
    expect(
      rowsToEnvFileText([
        { key: "PLAIN", value: "one" },
        { key: "SPACED", value: " keep " },
        { key: "MULTILINE", value: "line one\nline two" },
      ]),
    ).toBe('PLAIN=one\nSPACED=" keep "\nMULTILINE="line one\nline two"');
  });
});
