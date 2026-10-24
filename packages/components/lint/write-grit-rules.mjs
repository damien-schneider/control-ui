#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { gritRules } from "./grit-rules.mjs";

const { values } = parseArgs({
  options: {
    "import-source": { type: "string", multiple: true, default: [] },
    out: { type: "string" },
  },
});

if (!values.out) throw new Error("control-ui-grit needs --out <directory>");

mkdirSync(values.out, { recursive: true });
for (const [file, source] of Object.entries(gritRules(values["import-source"]))) {
  writeFileSync(path.join(values.out, file), source);
}
