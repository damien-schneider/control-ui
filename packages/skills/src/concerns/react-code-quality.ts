import type { PracticeSkillDefinition } from "../types";

const reactBestPracticesSource = {
  label: "Mastra react-best-practices",
  path: "../mastra/.claude/skills/react-best-practices",
};

export const reactCodeQualitySkills = [
  {
    id: "react-derive-dont-duplicate",
    title: "Derive, do not duplicate",
    concern: "react-code-quality",
    summary: "Avoid second sources of truth in component props, hook parameters, and local state.",
    goal: "Compute values from the source already in scope instead of asking callers to pass both source and derivative.",
    source: reactBestPracticesSource,
    checks: [
      "Derive itemCount, isEmpty, selected item, filtered count, and booleans from the data already passed in.",
      "Keep a single owner for each value; callers should not synchronize pairs such as items plus itemCount.",
      "When state mirrors props, check whether the value should be derived during render instead.",
    ],
    avoid: [
      "Props such as itemCount next to items, isEmpty next to a list, or selectedName next to selectedId and entities.",
      "Effects whose only job is to keep duplicated state synchronized.",
    ],
  },
  {
    id: "react-remount-state-boundaries",
    title: "Remount state boundaries",
    concern: "react-code-quality",
    summary: "Reset state by changing component identity or loading boundaries, not by syncing with effects.",
    goal: "When an upstream identity changes, remount the stateful branch so initializers naturally receive fresh data.",
    source: reactBestPracticesSource,
    checks: [
      "Lift the discriminant, such as selected id or route param, above the stateful form or editor.",
      "Render a skeleton or keyed branch while new data loads so stale state cannot flash.",
      "Use a key as the narrow fallback when there is no async boundary to restructure around.",
    ],
    avoid: [
      "useEffect blocks that call several setters to reset a form after props change.",
      "Rendering an editor once with the previous entity and correcting it after an effect runs.",
    ],
  },
  {
    id: "react-explicit-naming",
    title: "Explicit names instead of comments",
    concern: "react-code-quality",
    summary: "Encode intent in identifiers and extracted units so the code needs no explanatory comments.",
    goal: "When code needs explanation, rename or extract until the names carry it; reserve comments for constraints the code cannot express.",
    checks: [
      "Rename variables, functions, and components until the call site reads as the sentence the comment would have said.",
      "Extract a named function, variable, or component when a block needs a heading comment; the name replaces the heading.",
      "Name booleans and predicates for what they assert, such as isEmpty or hasSkinAdornment, not for how they compute.",
      "Keep the rare justified comment to one line stating a why the code cannot show: a constraint, a workaround, or an external contract.",
    ],
    avoid: [
      "Comments that restate the code, narrate the next line, or describe what a well-named extraction would say.",
      "Generic or abbreviated names such as data, tmp, or handleThing patched over with an explanatory comment.",
      "Section-divider comments inside a function instead of extracting named units.",
      "Keeping a stale comment in sync with code instead of deleting it once the name carries the intent.",
    ],
  },
  {
    id: "react-single-responsibility",
    title: "One responsibility per file",
    concern: "react-code-quality",
    summary: "Split domain components and hooks before fetching, filtering, selection, and form state become entangled.",
    goal: "Keep each domain component or hook responsible for one behavior so review, testing, and reuse stay local.",
    source: reactBestPracticesSource,
    checks: [
      "Extract a hook when data fetching and filtering can be named independently.",
      "Extract child components for list rendering, detail panels, and edit forms.",
      "Let the page/container compose hooks and children; composition is a valid single responsibility.",
    ],
    avoid: [
      "Files where comment headers divide unrelated responsibilities inside one component.",
      "Components with unrelated useState or useQuery clusters that always re-render together.",
    ],
  },
  {
    id: "react-narrow-apis",
    title: "Keep input and output APIs narrow",
    concern: "react-code-quality",
    summary: "Split oversized prop, argument, and return-value APIs into cohesive responsibilities.",
    goal: "Keep each component, hook, function, or utility API focused on one cohesive responsibility.",
    source: reactBestPracticesSource,
    checks: [
      "Treat unrelated clusters of props, arguments, return values, and handlers as evidence that the unit needs to split.",
      "Compose focused hooks and components at a page or container instead of hiding their composition in a mega-hook.",
      "Return only values owned by the responsibility; group values only when they form one meaningful concept.",
      "Judge cohesion from caller usage and reasons to change, not from an arbitrary parameter limit.",
      "Keep semantic and render inputs explicit: use named props, or narrow the children prop when its content type is the component contract.",
    ],
    avoid: [
      "APIs that span unrelated concerns such as querying, pagination, selection, permissions, and editing.",
      "Wrapping the same unrelated values in one options object and calling the API narrow.",
      "Pass-through mega-hooks that expose one large bag of internal state and handlers.",
      "Runtime type checks on ReactNode props such as children or label that recover semantic data or silently switch behavior; keep typeof guards at unknown and external boundaries.",
    ],
  },
  {
    id: "react-no-dom-queries",
    title: "Do not query the DOM in React",
    concern: "react-code-quality",
    summary: "Keep element identity and collections in React instead of searching rendered markup.",
    goal: "Never use querySelector or querySelectorAll in React code; use refs, props, state, and context to preserve ownership.",
    checks: [
      "Attach refs where elements are created and pass them through React-owned boundaries.",
      "Register dynamic element collections with callback refs and a ref-backed Map.",
      "Carry selection and identity through props, state, or context instead of rediscovering them from rendered attributes.",
      "Refactor existing DOM searches instead of suppressing or wrapping them.",
    ],
    avoid: [
      "querySelector and querySelectorAll in React source.",
      "Class-name or data-attribute selectors used to recover React-owned elements or state.",
      "Effects that scan rendered descendants instead of maintaining refs as elements mount and unmount.",
      "Lint exceptions, wrapper helpers, or selector utilities that hide DOM queries.",
    ],
  },
  {
    id: "react-real-stack-tests",
    title: "Real stack tests",
    concern: "react-code-quality",
    summary: "Prefer tests that drive production hooks, clients, routing, and cache behavior with only the network mocked.",
    goal: "Make a green test prove the real UI path, not a mocked copy of the implementation.",
    source: reactBestPracticesSource,
    checks: [
      "Render through the real provider stack when the component depends on cache, router, or client behavior.",
      "Mock network responses at the boundary and use production response types where available.",
      "Assert behavior visible to the user rather than duplicating implementation class strings or hook internals.",
    ],
    avoid: [
      "vi.mock for local hooks, services, auth gates, or SDK calls that the component is meant to exercise.",
      "Bespoke test-only data shapes that drift from production response types.",
    ],
  },
  {
    id: "react-test-rendered-output",
    title: "Test rendered output, not class names",
    concern: "react-code-quality",
    summary: "Prove visual behavior through computed styles, geometry, or browser output instead of Tailwind class strings.",
    goal: "Make style tests fail on a user-visible regression, not on an implementation-detail refactor.",
    source: reactBestPracticesSource,
    checks: [
      "Assert computed styles when CSS behavior is available in the DOM test runtime.",
      "Assert real geometry for layout and overflow, including dimensions, scrollWidth, and clientWidth.",
      "Use browser validation for pseudo-elements, media and container queries, hover or focus rendering, and layout-engine behavior.",
      "Assert class strings only when a class builder, class forwarding, or a public slot/classNames API is the contract under test.",
    ],
    avoid: [
      "Assertions that grep rendered HTML, source files, snapshots, className, or classList for Tailwind utilities to prove appearance.",
      "Calling a value computed when the test merely maps a class token to an expected CSS value.",
      "Keeping a class-name-only test when the current test runtime cannot observe the claimed behavior.",
    ],
  },
] as const satisfies readonly PracticeSkillDefinition[];
