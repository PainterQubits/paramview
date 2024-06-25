import { atom } from "jotai";
import { loadable } from "jotai/utils";
import { Data } from "@/types";
import { getDataDiff } from "@/utils/dataDiff";
import { originalDataAtom, latestDataAtom } from "@/atoms/api";

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
const editedDataStateAtom = atom<Data | Promise<Data> | null>(null);

/**
 * Current data that has been potentially edited by the user, and a function to update it.
 */
export const editedDataAtom = atom(
  (get) => get(editedDataStateAtom),
  (_, set, newEditedData: Data | Promise<Data>) =>
    set(editedDataStateAtom, newEditedData),
);

export const editedDataLoadableAtom = loadable(editedDataStateAtom);

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

    set(editModeStateAtom, newEditMode);
  },
);

/** Primitive atom to store the current value of commitDialogOpenAtom. */
export const commitDialogOpenStateAtom = atom(false);

/** Whether the commit dialog is open. */
export const commitDialogOpenAtom = atom(
  (get) => get(commitDialogOpenStateAtom),
  (get, set, newCommitDialogOpen: boolean) => {
    if (newCommitDialogOpen) {
      set(commitMessageAtom, "");

      // Set commitDataAtom to a fresh copy of editedDataAtom
      const editedDataCopy = (async () =>
        JSON.parse(JSON.stringify(await get(editedDataAtom))))();
      set(commitDataAtom, editedDataCopy);
    }

    set(commitDialogOpenStateAtom, newCommitDialogOpen);
  },
);

/** User-entered message to use for the next commit. */
export const commitMessageAtom = atom("");

const commitDataStateAtom = atom<Data | Promise<Data> | null>(null);

export const commitDataAtom = atom(
  (get) => get(commitDataStateAtom),
  (_, set, newCommitData: Data | Promise<Data>) =>
    set(commitDataStateAtom, newCommitData),
);

export const dataDiffAtom = atom(async (get) =>
  getDataDiff(await get(latestDataAtom), await get(commitDataAtom)),
);
