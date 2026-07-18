---
name: verify
description: Build/launch/drive recipe to verify changes to the docs app (apps/docs) at runtime in a real browser.
---

# Verify apps/docs at runtime

## Launch

- `bun run dev` from `apps/docs` serves on `127.0.0.1:3000`. The user's own dev server is often
  already running there (EADDRINUSE) — reuse it; `next dev` hot-reloads registry + fixture edits.
- Registry source edits (`src/registry/**`) only reach the app through the installed fixture:
  run `bun run sync:fixture` (from `apps/docs`, NOT repo root) after each edit, give hot reload
  ~2-3s before driving.

## Drive

- Use the `agent-browser` skill. `/` redirects to `/overview`. Sidebar links: `find role link click
  --name "..."` (plain `find text` collides with page prose).
- Rapid/timed interaction sequences can't be driven across CLI invocations (~400-500ms spawn each);
  do them inside a single `agent-browser eval "(async () => { ... })()"` with `element.click()` and
  `setTimeout` waits.
- Always finish with `agent-browser errors` — unhandled rejections (e.g. "Transition was skipped")
  land there, not in command output.

## Gotchas

- During a browser View Transition, PARTICIPATING elements stop being hit-testable (clicks on them
  land on `<html>`); with `:root { view-transition-name: none }` the rest of the DOM stays live.
  `document.elementFromPoint` sampling inside an eval is the way to observe input blocking;
  Playwright clicks silently wait out the animation instead of failing.
- `document.activeViewTransition` / `:active-view-transition` are NOT reliable with the root opted
  out (report false during a real transition). To observe the lifecycle, monkey-patch
  `document.startViewTransition` in an eval and log `updateCallbackDone`/`ready`/`finished`.
- Cold routes in dev spend a long time in the capture/update phase (rendering suppressed, page
  frozen); pre-warm routes by visiting them once before timing anything.

## Checks after (CI-parity, not verification)

`bun run validate` (catalog/fixture/registry/agent-docs drift), `bun run typecheck`, `bun test`
(from `apps/docs`, else `@/` doesn't resolve).
