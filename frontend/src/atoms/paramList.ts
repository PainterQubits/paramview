import { atom } from "jotai";
import { Data } from "@/types";
import { originalDataAtom } from "@/atoms/api";
import { selectedCommitIndexAtom } from "@/atoms/commitSelect";

/** Primitive atom to store the current value of collapseAtom. */
const collapseStateAtom = atom(Symbol());

/**
 * Value that causes parameter lists to collapse when it changes and a function to change
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

/**
 * Primitive atom to store value of editedDataAtom. Initializing to an infinite promise
 * means the edited data will be loading until editedDataAtom is set.
 */
const editedDataStateAtom = atom<Data | Promise<Data>>(new Promise<Data>(() => {}));

/**
 * Current data that has been potentially edited by the user, and a function to update it.
 */
export const editedDataAtom = atom(
  (get) => (get(editModeAtom) ? get(editedDataStateAtom) : get(originalDataAtom)),
  (_, set, newEditedData: Data | Promise<Data>) =>
    set(editedDataStateAtom, newEditedData),
);

/** Primitive atom to store the current value of editModeAtom. */
const editModeStateAtom = atom(false);

/** Whether edit mode is currently enabled and a function to update it. */
export const editModeAtom = atom(
  (get) => get(editModeStateAtom),
  (get, set, newEditMode: boolean) => {
    if (newEditMode) {
      // Reset editedDataAtom
      set(
        editedDataAtom,
        get(originalDataAtom).then((originalData) =>
          JSON.parse(JSON.stringify(originalData)),
        ),
      );
    }

    set(selectedCommitIndexAtom, { type: "sync" });
    set(editModeStateAtom, newEditMode);
  },
);
