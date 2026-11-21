import { isolateHistory } from "@codemirror/commands";
import { Facet } from "@codemirror/state";
import { type EditorView, WidgetType } from "@codemirror/view";

export type TaskCheckbox = { checked: boolean; label: string; toggle: (checked: boolean) => void };
export type TaskCheckboxEntry = { host: HTMLElement; key: string; checkbox: TaskCheckbox };

/** Task checkboxes render as React portals: each widget registers its host element, the editor content renders into it. */
export class TaskCheckboxes {
  private entries = new Map<HTMLElement, TaskCheckboxEntry>();
  private listeners = new Set<() => void>();
  private snapshot: readonly TaskCheckboxEntry[] = [];
  private nextKey = 0;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  set(host: HTMLElement, checkbox: TaskCheckbox | null) {
    if (checkbox) this.entries.set(host, { host, key: this.entries.get(host)?.key ?? String(this.nextKey++), checkbox });
    else if (!this.entries.delete(host)) return;
    this.snapshot = Array.from(this.entries.values());
    for (const listener of this.listeners) listener();
  }
}

export const taskCheckboxes = Facet.define<TaskCheckboxes, TaskCheckboxes | null>({ combine: (values) => values[0] ?? null });

const registryOf = new WeakMap<HTMLElement, TaskCheckboxes>();

function toggleTask(view: EditorView, host: HTMLElement, checked: boolean) {
  if (view.state.readOnly || !host.isConnected) return;
  const from = view.posAtDOM(host);
  if (!/^\[[ xX]\]$/.test(view.state.sliceDoc(from, from + 3))) return;
  view.dispatch({
    changes: { from: from + 1, to: from + 2, insert: checked ? "x" : " " },
    annotations: isolateHistory.of("full"),
    userEvent: "input.toggle",
  });
}

export class TaskWidget extends WidgetType {
  constructor(
    readonly checked: boolean,
    readonly label: string,
  ) {
    super();
  }

  eq(other: TaskWidget) {
    return other.checked === this.checked && other.label === this.label;
  }

  toDOM(view: EditorView) {
    const host = document.createElement("span");
    host.dataset.controlUi = "markdown-editor";
    host.dataset.controlFamily = "markdown-editor";
    host.dataset.slot = "task-checkbox";
    this.register(view, host);
    return host;
  }

  updateDOM(host: HTMLElement, view: EditorView) {
    this.register(view, host);
    return true;
  }

  destroy(host: HTMLElement) {
    registryOf.get(host)?.set(host, null);
    registryOf.delete(host);
  }

  private register(view: EditorView, host: HTMLElement) {
    const registry = view.state.facet(taskCheckboxes);
    if (!registry) return;
    registryOf.set(host, registry);
    registry.set(host, { checked: this.checked, label: this.label, toggle: (checked) => toggleTask(view, host, checked) });
  }
}

export class BulletWidget extends WidgetType {
  eq() {
    return true;
  }

  toDOM() {
    const bullet = document.createElement("span");
    bullet.className = "cm-md-bullet";
    bullet.textContent = "•";
    bullet.setAttribute("aria-hidden", "true");
    return bullet;
  }
}

export class ImageWidget extends WidgetType {
  constructor(
    readonly src: string,
    readonly alt: string,
    readonly title: string,
  ) {
    super();
  }

  eq(other: ImageWidget) {
    return other.src === this.src && other.alt === this.alt && other.title === this.title;
  }

  toDOM() {
    const image = document.createElement("img");
    image.src = this.src;
    image.alt = this.alt;
    if (this.title) image.title = this.title;
    image.className = "cm-md-image";
    return image;
  }

  /** A click on the image puts the caret beside it, which reveals its Markdown. */
  ignoreEvent() {
    return false;
  }
}
