import { atom } from "jotai";

const collapseStateAtom = atom(Symbol());

/**
 * Value that causes parameter lists to collapse when it changes, and a function to change
 * it.
 */
export const collapseAtom = atom(
  (get) => get(collapseStateAtom),
  (_, set) => set(collapseStateAtom, Symbol()),
);

const roundStateAtom = atom(true);

/** Whether to round parameters and a toggle function. */
export const roundAtom = atom(
  (get) => get(roundStateAtom),
  (get, set) => set(roundStateAtom, !get(roundStateAtom)),
);
