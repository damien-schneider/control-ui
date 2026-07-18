import type { PracticeSkillDefinition } from "../types";

export const architectureSkills = [
  {
    id: "architecture-cohesive-folders",
    title: "Cohesive folders",
    concern: "architecture",
    summary: "Keep every folder a short, readable table of contents by grouping loose files into named responsibilities.",
    goal: "Make each folder express one nameable intent so a reader can predict its contents without opening files, and promote the hidden grouping into a folder when loose files accumulate.",
    checks: [
      "Treat roughly seven loose files in one folder as the review threshold: beyond it, find the implicit groups — shared responsibility, shared consumer, or shared lifecycle — and promote each into its own folder.",
      "Read a shared filename prefix across several files as a folder that was never created; promote the prefix into a directory and drop it from the filenames.",
      "Name every folder after its single responsibility; a file you cannot place without hesitation reveals a grouping that does not exist yet.",
      "Keep only framework-reserved files at conventional roots, such as route files, entrypoints, and global config; everything else lives in a named group.",
      "Colocate what changes together: a unit's component, styles, hooks, tests, and helpers sit in that unit's folder rather than sorted by file kind at the top level.",
    ],
    avoid: [
      "Junk-drawer folders such as utils, helpers, misc, common, or shared that accept anything and grow without bound.",
      "Generic catch-all filenames such as utils.ts, helpers.ts, types.ts, or constants.ts at broad scope; scope them to the unit they serve or name the actual content.",
      "Disambiguating with filename prefixes instead of directories once several files share the same prefix.",
      "Overcorrecting into single-file folders or deep nesting; a folder earns its existence by grouping several related files.",
    ],
  },
  {
    id: "architecture-single-source-of-truth",
    title: "Single source of truth",
    concern: "architecture",
    summary: "Prevent shared facts from drifting by assigning each one a canonical owner.",
    goal: "Give every fact one authoritative definition and derive, generate, or validate every other representation from it.",
    checks: [
      "Name the canonical owner for each fact, such as a schema, manifest, config definition, or state owner, and keep dependency direction downstream from it.",
      "Derive types, ids, registries, routes, navigation, docs metadata, defaults, view values, and structural test fixtures instead of restating the same fields or allowed values.",
      "Treat generated manifests, mirrored fixtures, public mirrors, and serialized projections as read-only outputs; regenerate them reproducibly and fail validation when they drift.",
      "When direct derivation is impossible, isolate one adapter or synchronization boundary with an explicit owner, lifecycle, and invalidation rule.",
    ],
    avoid: [
      "Parallel hand-maintained enums, lists, defaults, route maps, docs tables, config values, fixtures, or UI state for the same fact.",
      "Two writable peers kept aligned by effects, listeners, copy steps, or bidirectional synchronization without an authoritative owner.",
      "Editing generated output or copied fixtures directly instead of changing the canonical source and regenerating.",
      "A god manifest that owns unrelated concepts; single source of truth means one owner per fact, not one file for the whole system.",
    ],
  },
] as const satisfies readonly PracticeSkillDefinition[];
