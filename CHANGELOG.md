# Changelog

Changes to the components, skins, and the `@ctrl-ui/react` package. While Control UI is on 0.x, a minor version can break an API or a skin contract; those changes are listed under **Breaking**. Docs-site-only changes are left out.

## 0.15.0 (2026-11-27)

- `Tree`: `expandOnClick={false}` lets a row that has children open on click or Enter without expanding. The chevron and arrow keys still expand it. The default stays `true`, so existing trees behave as before.

## 0.14.0 (2026-11-26)

- `CodeDiff`: line numbers become toggle buttons when `onSelectedLinesChange` is set. Select by click, drag, Shift or Cmd/Ctrl-click, Enter or Space, and Shift+Arrow.
- `CodeDiff`: `annotations` and `renderAnnotation` place a full-width row after a line.
- `CodeDiff`: `ignoreWhitespace`, `header={false}`, and `maxHeight="none"` let a page of diffs scroll as one.
- `lib/diff` exports `buildDiffFromFiles`, `linesInRange`, `DiffLineRange`, `DiffLinePoint`, and `CodeDiffAnnotation`.
- New knobs for selected lines, gutter hover, and annotation background.

## 0.13.2 (2026-11-25)

- `Tabs`: scrollable tab lists fade their hidden edges.

## 0.13.1 (2026-11-25)

- The remaining text glyph icons go through the skin `icons` slot.

## 0.13.0 (2026-11-25)

- Skins can replace every component icon: `ControlUiSkin.icons` maps `SkinIconName` keys to icon components. Unset keys keep each component's default.
- `useSkinIcon(name, Fallback)` and `SkinIcon` resolve instance props, then skin icons, then the default.
- `Spinner` is now a client module.

**Breaking**

- `MarkdownEditorFormatAction` takes `icon` (a `SkinIconName`) and `fallbackIcon` instead of `Icon`.

## 0.12.3 (2026-11-24)

- `Chat`: the conversation scrolls from anywhere beside the composer.

## 0.12.2 (2026-11-24)

- `Chat` and `Sidebar`: changing values stay live in WebKit, and the jump button shows when a reply is streaming.

## 0.12.1 (2026-11-24)

- `CodeDiff`: proposals open at full length, rewrites show no chips, and gap labels are plain text.
- `Activity`: a running group's state no longer leaks onto the steps nested in it.

## 0.12.0 (2026-11-24)

**Breaking**

- `ButtonGroupSeparator` is removed. Seams between segments are automatic in both join modes.
- `--cui-button-group-separator-background` is renamed to `--cui-button-group-separator-color` and now colors the seam borders.

## 0.11.4 (2026-11-24)

- `ButtonGroup`: joined segments are framed instead of overlapping.

## 0.11.3 (2026-11-22)

- Skins: badges, tabs, sliders, and the composer fit their container's corner.
- `MarkdownEditor` live preview: an added empty line between blocks is kept, block gaps stay still, heading marks are revealed, and phantom rich edits are gone.

## 0.11.2 (2026-11-21)

- `MarkdownEditor` live preview runs its extensions inside table cells.

## 0.11.1 (2026-11-21)

- `MarkdownEditor` live preview accepts CodeMirror extensions.
- Skins: the glass dock veil is back on cuicui, liquid-metal, and modern-apple.

## 0.11.0 (2026-11-21)

- New `ChatWorkspace` kit: the chat floats over the content or pins beside it as a resizable column, without remounting.
- `MarkdownEditor` has a live-preview mode built on CodeMirror.
- `Badge` has a `ghost` variant, and badge icons follow the badge's text size.
- `SwapText` rolls a changing label. `ActionBar` gains a `Meta` part.
- New APIs: `TabsTab` `onClose` and `closeLabel`, `IconPicker` `iconColor`, `TextLink`, `Heading size="hero"`, `ChatComposerHeader`, `PageBody` `asideWidth`, `SidebarMenuButton` `iconTone`.
- Every item installs `docs/<id>.md` beside its source, and the package ships them at `dist/docs/<id>.md`.
- Quieter focus and selection: text fields, the composer, and the markdown editor use a subtle `--focus-rim` edge tint instead of an outline. Forced-colors mode keeps the system outline.
- Accessibility: `Select`, `Combobox`, and `Autocomplete` listboxes are named after their owner; modal `Dialog`, `AlertDialog`, and `Drawer` popups are `aria-modal`.
- Fixes: hover no longer restyles the whole page, pasted screenshots in `Dropzone` attach, the sidebar resize rail keeps up with the pointer, and long scroll lists no longer freeze.

**Breaking**

- `ChatComposer` defaults to `layout="auto"`: it rests on one line and opens on focus, a draft, or attachments. Pass `layout="stacked"` to keep it open.
- `--radius-popover`, `--radius-popup-item-fit`, and `--radius-composer` are computed from padding. Skins should stop setting them.
- A non-modal `Drawer` has no backdrop.

Releases before 0.11.0 are in the [git history](https://github.com/damien-schneider/control-ui/commits/main).
