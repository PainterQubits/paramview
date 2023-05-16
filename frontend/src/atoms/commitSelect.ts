import { atom } from "jotai";
import { editModeAtom } from "@/atoms/paramList";

export const syncLatestStateAtom = atom(true);

/** Whether to sync the current commit index with the latest commit. */
export const syncLatestAtom = atom(
  (get) => !get(editModeAtom) && get(syncLatestStateAtom),
  (_, set, newSyncLatest: boolean) => set(syncLatestStateAtom, newSyncLatest),
);

/** Index of the currently selected commit in the commit history. */
export const selectedCommitIndexAtom = atom<number>(0);

/** Whether commit selection is currently frozen, meaning the commit cannot be changed. */
export const commitSelectFrozenAtom = atom(false);
