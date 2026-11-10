import { describe, expect, test } from "bun:test";
import { cn } from "./cn";

// Components pass `cn(defaults, className)`: the caller's class has to replace the default it competes with,
// otherwise both ship and stylesheet order decides which one paints.
describe("cn", () => {
  test("a caller size replaces a control-height default", () => {
    expect(cn("h-control-sm min-w-control-sm", "h-10 min-w-12")).toBe("h-10 min-w-12");
    expect(cn("size-control-md", "size-12")).toBe("size-12");
    expect(cn("h-8", "h-control-lg")).toBe("h-control-lg");
  });

  test("a caller radius replaces a role radius", () => {
    expect(cn("rounded-control", "rounded-none")).toBe("rounded-none");
    expect(cn("rounded-lg", "rounded-panel")).toBe("rounded-panel");
    expect(cn("rounded-t-field", "rounded-t-none")).toBe("rounded-t-none");
  });

  test("a caller shadow replaces any theme shadow tier", () => {
    expect(cn("shadow-overlay", "shadow-none")).toBe("shadow-none");
    expect(cn("shadow-sm", "shadow-inset")).toBe("shadow-inset");
    expect(cn("shadow-pop", "shadow-modal")).toBe("shadow-modal");
  });

  test("a type rung is a size, so it keeps its color and leading and yields to another size", () => {
    expect(cn("text-body text-muted-foreground", "leading-6")).toBe("text-body text-muted-foreground leading-6");
    expect(cn("text-body", "text-label")).toBe("text-label");
  });

  test("a shadow tier keeps a shadow color beside it", () => {
    expect(cn("shadow-pop", "shadow-red-500")).toBe("shadow-pop shadow-red-500");
  });
});
