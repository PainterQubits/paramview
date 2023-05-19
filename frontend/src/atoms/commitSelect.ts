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
const selectedCommitIndexStateAtom = atom(0);

/** Index of the currently selected commit in the commit history. */
export const selectedCommitIndexAtom = atom(
  (get) => {
    if (!get(syncLatestAtom)) {
      return get(selectedCommitIndexStateAtom);
    }

    const commitHistory = get(commitHistoryAtom);
    return commitHistory !== null ? commitHistory.length - 1 : 0;
  },
  (get, set, action: selectCommitIndexAction) => {
    console.log(action);
    if (action.type === "sync") {
      set(selectedCommitIndexStateAtom, get(selectedCommitIndexAtom));
    } else {
      set(selectedCommitIndexStateAtom, action.value);
    }
  },
);
