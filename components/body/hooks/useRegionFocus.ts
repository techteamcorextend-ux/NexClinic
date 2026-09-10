"use client";

import { useSyncExternalStore } from "react";
import type { BodySide, FocusSource, FocusTarget, RegionId } from "../types";
import { SIDE_ANY } from "../types";

/**
 * The single state machine behind the viewer. Four inputs compete for focus;
 * precedence is resolved here, once, rather than re-derived by every
 * component that cares.
 *
 *   locked  — the user clicked a region. Parks the camera, pins the callout
 *             and takes scroll out of the loop until released.
 *   hover   — raycast against the mesh.
 *   scroll  — the default driver (IntersectionObserver over the sections).
 *   idle    — nothing has happened for a while; drift back to neutral.
 *
 * The brief specified zustand. This environment's npm registry is blocked,
 * so rather than ship an uninstallable dependency the same ~40 lines sit
 * here on React's own `useSyncExternalStore`. The call sites are unchanged:
 * `useRegionFocus(selector)` plus `.getState()` / `.setState()`.
 */

type Listener = () => void;

type Setter<T> = (patch: Partial<T> | ((state: T) => Partial<T>)) => void;

type StoreHook<T> = {
  <S>(selector: (state: T) => S): S;
  getState: () => T;
  setState: Setter<T>;
  subscribe: (listener: Listener) => () => void;
};

function createStore<T extends object>(
  init: (set: Setter<T>, get: () => T) => T,
): StoreHook<T> {
  const listeners = new Set<Listener>();

  const set: Setter<T> = (patch) => {
    const next = typeof patch === "function" ? patch(state) : patch;
    let changed = false;
    for (const key of Object.keys(next) as (keyof T)[]) {
      if (!Object.is(state[key], next[key])) {
        changed = true;
        break;
      }
    }
    if (!changed) return;
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  };

  const get = () => state;
  // Definite-assignment: `set`/`get` close over `state`, but neither runs
  // until after `init` returns, so the TDZ is never actually entered.
  let state!: T;
  state = init(set, get);

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const useStore = <S,>(selector: (state: T) => S): S =>
    useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(state),
    );

  const hook = useStore as StoreHook<T>;
  hook.getState = get;
  hook.setState = set;
  hook.subscribe = subscribe;
  return hook;
}

type Slot = { region: RegionId; side: number } | null;

export type RegionFocusState = {
  locked: Slot;
  hovering: Slot;
  scrolled: FocusTarget | null;
  idle: boolean;
  /** Bumped on any user input; the camera rig watches it to break idle. */
  lastInputAt: number;

  setHover: (region: RegionId, side: BodySide) => void;
  clearHover: () => void;
  setScroll: (region: FocusTarget) => void;
  toggleLock: (region: RegionId, side: BodySide) => void;
  unlock: () => void;
  setIdle: (idle: boolean) => void;
  noteInput: () => void;
};

export const useRegionFocus = createStore<RegionFocusState>((set, get) => ({
  locked: null,
  hovering: null,
  scrolled: "full",
  idle: false,
  lastInputAt: 0,

  setHover: (region, side) => {
    const current = get().hovering;
    if (current && current.region === region && current.side === side) return;
    set({ hovering: { region, side }, idle: false, lastInputAt: Date.now() });
  },

  clearHover: () => {
    if (!get().hovering) return;
    set({ hovering: null });
  },

  setScroll: (region) => {
    if (get().scrolled === region) return;
    set({ scrolled: region, idle: false, lastInputAt: Date.now() });
  },

  toggleLock: (region, side) => {
    const current = get().locked;
    const same = current && current.region === region && current.side === side;
    set({ locked: same ? null : { region, side }, idle: false, lastInputAt: Date.now() });
  },

  unlock: () => set({ locked: null, idle: false, lastInputAt: Date.now() }),

  setIdle: (idle) => set({ idle }),

  noteInput: () => set({ idle: false, lastInputAt: Date.now() }),
}));

export type ResolvedFocus = {
  target: FocusTarget;
  side: number;
  source: FocusSource;
};

/**
 * Derived state is memoised against the state object it came from:
 * `useSyncExternalStore` compares snapshots by identity and would spin
 * forever on a selector that allocates a fresh object every read.
 */
let cachedFrom: RegionFocusState | null = null;
let cachedFocus: ResolvedFocus | null = null;

export function resolveFocus(state: RegionFocusState): ResolvedFocus {
  if (cachedFrom === state && cachedFocus) return cachedFocus;

  let focus: ResolvedFocus;
  if (state.locked) {
    focus = { target: state.locked.region, side: state.locked.side, source: "locked" };
  } else if (state.hovering) {
    focus = { target: state.hovering.region, side: state.hovering.side, source: "hover" };
  } else if (state.idle) {
    focus = { target: "full", side: SIDE_ANY, source: "idle" };
  } else {
    focus = { target: state.scrolled ?? "full", side: SIDE_ANY, source: "scroll" };
  }

  cachedFrom = state;
  cachedFocus = focus;
  return focus;
}

/** Convenience selector for components that only need the winning focus. */
export function useResolvedFocus(): ResolvedFocus {
  return useRegionFocus(resolveFocus);
}
