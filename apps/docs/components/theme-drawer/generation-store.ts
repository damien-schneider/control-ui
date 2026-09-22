"use client";

import { useSyncExternalStore } from "react";

import type { Generation } from "./theme-generation";

type GenerationState = {
  generations: Generation[];
  isOpen: boolean;
  isRunning: boolean;
};

// A generated theme may select a skin that scrolls the page instead of an inset viewport, and that
// choice remounts everything under PageLayout — this drawer included. Keeping the log and the open flag
// outside React means the drawer comes back up where it left off instead of vanishing at the finish line.
let state: GenerationState = { generations: [], isOpen: false, isRunning: false };
const listeners = new Set<() => void>();

function setState(next: GenerationState) {
  state = next;
  for (const listener of listeners) listener();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const emptyState: GenerationState = { generations: [], isOpen: false, isRunning: false };

export function useGenerationState(): GenerationState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => emptyState,
  );
}

export function setDrawerOpen(isOpen: boolean) {
  setState({ ...state, isOpen });
}

export function setRunning(isRunning: boolean) {
  setState({ ...state, isRunning });
}

export function addGeneration(generation: Generation) {
  setState({ ...state, generations: [...state.generations, generation] });
}

export function updateGeneration(id: string, update: (generation: Generation) => Generation) {
  setState({
    ...state,
    generations: state.generations.map((generation) => (generation.id === id ? update(generation) : generation)),
  });
}
