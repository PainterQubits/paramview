import { atom } from "jotai";
import { Data } from "@/types";
import { originalDataAtom } from "@/atoms/api";

/** Primitive atom to store the current value of collapseAtom. */
const collapseStateAtom = atom(Symbol());

/**
 * Value that causes parameter lists to collapse when it changes, and a function to change
 * it.
 */
export const collapseAtom = atom(
  (get) => get(collapseStateAtom),
  (_, set) => set(collapseStateAtom, Symbol()),
);

/** Primitive atom to store the current value of roundStateAtom. */
const roundStateAtom = atom(true);

/** Whether to round parameters and a toggle function. */
export const roundAtom = atom(
  (get) => get(roundStateAtom),
  (get, set) => set(roundStateAtom, !get(roundStateAtom)),
);

/** Primitive atom to store the current value of editModeAtom. */
const editModeStateAtom = atom(false);

/** Whether edit mode is currently enabled. */
export const editModeAtom = atom(
  (get) => get(editModeStateAtom),
  (get, set) => set(editModeStateAtom, !get(editModeStateAtom)),
);

/** Primitive atom to store value of edited data. */
const editedDataStateAtom = atom<Promise<Data> | undefined>(undefined);

/**
 * Current data that has been potentially edited by the user. The set function resets the
 * edited data to a new copy of the data for the current commit.
 */
export const editedDataAtom = atom(
  (get) => get(editedDataStateAtom) ?? get(originalDataAtom),
  (get, set) =>
    set(
      editedDataStateAtom,
      get(originalDataAtom).then((originalData) =>
        JSON.parse(JSON.stringify(originalData)),
      ),
    ),
);

export const commitDialogOpenAtom = atom(false);
