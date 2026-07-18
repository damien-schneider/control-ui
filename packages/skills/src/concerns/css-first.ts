import type { PracticeSkillDefinition } from "../types";

// CSS-first is a library principle: model interaction, sizing, motion in modern CSS + native platform elements before React state/effects/handlers.
// Declarative CSS is server-rendered, survives hydration, honours reduce-motion tokens, ships zero JS — a skin can restyle it, a slow device still runs it.
export const cssFirstSkills = [
  {
    id: "css-first-interactivity",
    title: "CSS-first interactivity",
    concern: "css-first",
    summary:
      "Model UI reactions with relational selectors, container/style queries, and native platform elements before adding React state, effects, or event handlers.",
    goal: "Keep interaction declarative, server-renderable, and JavaScript-free by expressing it in CSS the browser already resolves — reserve React state for logic that is genuinely stateful or asynchronous.",
    checks: [
      "Reveal, size, or restyle from a sibling/parent/child's state with `:has()`, `:focus-within`, and sibling combinators (Tailwind `has-*`, `group-has-*`, `peer-has-*`, `not-*`) instead of tracking hover, open, or selection in `useState` + `onMouseEnter`/`onFocus` handlers.",
      "Adapt layout to available width with container queries (`@container` + `@md:`/`@max-md:`) rather than a `ResizeObserver` measuring the element in JS; use `@container style(--x: y)` or a `data-*` attribute variant to branch on a token instead of reading a CSS variable in JS.",
      "Let native elements own open state, dismissal, and the top layer: the `popover` attribute + Popover API (Baseline widely available) and `<dialog>` replace hand-written outside-click, Escape, focus-trap, and z-index code; `<details>`/`::details-content` gives a semantic, JS-free disclosure for tool activity and reasoning surfaces.",
      "Style form and choice state natively: `:user-valid`/`:user-invalid` and `:in-range`/`:out-of-range` (Tailwind `user-invalid:`, `in-range:`) drive validation UI, and `peer-checked:`/`has-checked:` + `accent-color` drive custom switches and checkboxes without mirroring the value into React.",
    ],
    avoid: [
      "`useState` + `onMouseEnter`/`onMouseLeave`/`onFocus`/`onBlur` (or `useEffect` listeners) whose only job is toggling a class a selector could match.",
      "`ResizeObserver`/`getBoundingClientRect` used only to pick a responsive layout a container query already expresses, or `getComputedStyle` read in JS to decide a className.",
      "Reimplementing dropdowns, tooltips, menus, and modals from raw divs when the native popover/dialog primitives already own open state, light-dismiss, and focus.",
    ],
  },
  {
    id: "css-first-motion-and-sizing",
    title: "CSS-first motion & sizing",
    concern: "css-first",
    summary:
      "Drive sizing, enter/exit motion, and scroll effects from CSS and native attributes — token-driven and progressively enhanced — instead of measuring and animating values in JavaScript.",
    goal: "Move sizing and motion off the main thread and out of effects, keeping every duration on the theme's motion tokens and every cutting-edge property behind a working fallback.",
    checks: [
      "Auto-grow inputs with `field-sizing: content` (Tailwind `field-sizing-content`, bounded by `min-h`/`max-h`) instead of a ref copying `scrollHeight` back into a height; fade scroll edges with a `mask-image` gradient driven by overflow attributes, not a scroll listener.",
      "Animate enter/exit with `@starting-style` + `transition-behavior: allow-discrete` (Tailwind `starting:` + `transition-discrete`) rather than mount/unmount timers or an animation library, and keep every duration/easing on the theme's `--duration-*`/`--ease-*` tokens so the reduce-motion kill-switch flattens them.",
      "Animate to intrinsic size with the `grid-template-rows: 0fr → 1fr` collapse (widely supported) as the base, and progressively enhance to `interpolate-size: allow-keywords`/`calc-size(auto)` behind `@supports`, instead of measuring the panel and animating a pixel height.",
      "Guard Limited features — anchor positioning (`anchor()`/`position-try`), scroll-driven animations (`animation-timeline: scroll()`/`view()`), style queries, and `if()` — behind `@supports`, keeping the JS path (Floating UI, `IntersectionObserver`) as the fallback so an unsupported browser still gets a correct, static result.",
    ],
    avoid: [
      "Measuring `scrollHeight`/`getBoundingClientRect` on every keystroke, resize, or scroll to set a style a container query, `field-sizing`, or scroll-driven animation already reaches.",
      "JS enter/exit libraries for a fade or slide that `@starting-style` plus a token transition expresses in a few lines.",
      "Shipping an experimental CSS feature (anchor positioning, `if()`, `interpolate-size`, scroll-driven timelines) as a hard dependency with no `@supports` fallback, or hardcoding millisecond durations that bypass the motion tokens and the reduce-motion kill-switch.",
    ],
  },
] as const satisfies readonly PracticeSkillDefinition[];
