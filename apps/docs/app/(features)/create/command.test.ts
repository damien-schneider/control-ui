import { describe, expect, test } from "bun:test";
import { createAppCommand, normalizeProjectName } from "./command";

describe("create app command", () => {
  test("keeps shadcn defaults and installs the Next starter registry item", () => {
    expect(createAppCommand({ packageManager: "npm", projectName: "my-app", registryBaseUrl: "https://control-ui.example/" })).toBe(
      "npx shadcn@latest init --template next --defaults --name my-app --no-monorepo --force https://control-ui.example/r/next-app.json && cd my-app && npm run dev",
    );
  });

  test("uses the selected package runner for creation and startup", () => {
    const command = createAppCommand({ packageManager: "bun", projectName: "demo", registryBaseUrl: "https://control-ui.example" });

    expect(command).toStartWith("bunx --bun shadcn@latest init");
    expect(command).toEndWith("&& cd demo && bun dev");
  });

  test("avoids the local registry port when starting a local app", () => {
    expect(createAppCommand({ packageManager: "npm", projectName: "demo", registryBaseUrl: "http://127.0.0.1:3000" })).toEndWith(
      "&& cd demo && npm run dev -- --port 3001",
    );
  });

  test("normalizes project folder names", () => {
    expect(normalizeProjectName("  My Control UI!  ")).toBe("my-control-ui");
    expect(normalizeProjectName("---")).toBe("my-control-ui-app");
  });
});
