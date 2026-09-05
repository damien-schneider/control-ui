import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/**/*.{ts,tsx}"],
  format: "esm",
  platform: "neutral",
  unbundle: true,
  dts: true,
  copy: [{ from: "src/styles", to: "dist" }],
});
