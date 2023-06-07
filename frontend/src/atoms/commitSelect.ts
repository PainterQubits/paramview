import { atom } from "jotai";
import { commitHistoryAtom } from "@/atoms/api";
import { editModeAtom } from "@/atoms/paramList";

/** Primitive atom to store the current value of syncLatestAtom. */
const syncLatestStateAtom = atom(true);

/** Whether to sync the current commit index with the latest commit. */
export const syncLatestAtom = atom(
  (get) => !get(editModeAtom) && get(syncLatestStateAtom),
  (_, set, newSyncLatest: boolean) => set(syncLatestStateAtom, newSyncLatest),
);

type selectCommitIndexAction = { type: "sync" } | { type: "set"; value: number };

/** Index of the latest commit. */
const latestCommitIndexAtom = atom<Promise<number>>(
  async (get) => (await get(commitHistoryAtom)).length - 1,
);

/** Primitive atom to store the current value of selectedCommitIndexAtom. */
const selectedCommitIndexStateAtom = atom<number | Promise<number>>(0);

/**
 * Index of the currently selected commit in the commit history, or the latest atom if
 * syncLatestAtom is true.
 *
 * The set function can sync the underlying state atom with the true current index (which
 * might be the latest atom if syncLatest is true), or set the underlying state atom to a
 * specific value.
 */
export const selectedCommitIndexAtom = atom(
  (get) =>
    get(syncLatestAtom) ? get(latestCommitIndexAtom) : get(selectedCommitIndexStateAtom),

  (get, set, action: selectCommitIndexAction) => {
    if (action.type === "sync") {
      if (get(syncLatestAtom)) {
        set(selectedCommitIndexStateAtom, get(latestCommitIndexAtom));
      }
    } else {
      // Set action
      set(selectedCommitIndexStateAtom, action.value);
    }
  },
);
