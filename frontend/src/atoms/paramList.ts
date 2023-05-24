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

/** Primitive atom to store the current value of editModeAtom. */
const editModeStateAtom = atom(false);

/** Whether edit mode is currently enabled and a function to update it. */
export const editModeAtom = atom(
  (get) => get(editModeStateAtom),
  (_, set, newEditMode: boolean) => {
    set(selectedCommitIndexAtom, { type: "sync" });
    set(editModeStateAtom, newEditMode);
  },
);

/**
 * Primitive atom to store value of editedDataAtom. Initializing to an infinite promise
 * means the edited data will be loading until editedDataAtom is set.
 */
const editedDataStateAtom = atom<Data | Promise<Data>>(new Promise<Data>(() => {}));

type editedDataAction = { type: "reset" } | { type: "set"; value: Data };

/**
 * Current data that has been potentially edited by the user.
 *
 * The set function can reset the edited data to a new copy of the original data for the
 * current commit, or set the edited data to a new value.
 */
export const editedDataAtom = atom(
  (get) => (get(editModeAtom) ? get(editedDataStateAtom) : get(originalDataAtom)),
  (get, set, action: editedDataAction) => {
    if (action.type === "reset") {
      set(
        editedDataStateAtom,
        get(originalDataAtom).then((originalData) =>
          JSON.parse(JSON.stringify(originalData)),
        ),
      );
    } else {
      set(editedDataStateAtom, action.value);
    }
  },
);
