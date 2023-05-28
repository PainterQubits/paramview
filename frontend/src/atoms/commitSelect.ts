import { atom } from "jotai";
import { commitHistoryAtom } from "@/atoms/api";
import { editModeAtom } from "@/atoms/paramList";

/** Primitive atom to store the current value of syncLatestAtom. */
const syncLatestStateAtom = atom(true);

/** Whether to sync the current commit index with the latest commit. */
export const syncLatestAtom = atom(
  (get) => !get(editModeAtom) && get(syncLatestStateAtom),
  (_, set, newSyncLatest: boolean) => {
    set(selectedCommitIndexAtom, { type: "sync" });
    set(syncLatestStateAtom, newSyncLatest);
  },
);

type selectCommitIndexAction = { type: "sync" } | { type: "set"; value: number };

/** Primitive atom to store the current value of selectedCommitIndexAtom. */
const selectedCommitIndexStateAtom = atom<number | Promise<number>>(0);

/**
 * Index of the currently selected commit in the commit history, or the latest atom if
 * syncLatestAtom is true.
 *
 * The set function can sync the underlying state atom with the current value (which might
 * be the latest atom), or set the underlying state atom to a specific value.
 */
export const selectedCommitIndexAtom = atom(
  async (get) => {
    if (get(syncLatestAtom)) {
      const commitHistory = await get(commitHistoryAtom);
      return commitHistory !== null ? commitHistory.length - 1 : 0;
    }

    return get(selectedCommitIndexStateAtom);
  },
  (get, set, action: selectCommitIndexAction) => {
    if (action.type === "sync") {
      set(selectedCommitIndexStateAtom, get(selectedCommitIndexAtom));
    } else {
      // Set action
      set(selectedCommitIndexStateAtom, action.value);
    }
  },
);
