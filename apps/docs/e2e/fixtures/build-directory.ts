import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export const FIXTURE_BUILD_DIRECTORY_VARIABLE = "CONTROL_UI_FIXTURE_BUILD_DIRECTORY";

export default function createFixtureBuildDirectory() {
  const directory = mkdtempSync(path.join(tmpdir(), "control-ui-fixtures-"));
  process.env[FIXTURE_BUILD_DIRECTORY_VARIABLE] = directory;
  return () => rmSync(directory, { recursive: true, force: true });
}
