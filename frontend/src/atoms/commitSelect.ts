import { atom } from "jotai";
import { databaseNameAtom, commitHistoryAtom } from "@/atoms/api";

/** Whether to sync the current commit index with the latest commit. */
export const syncLatestAtom = atom(true);

/** Keeps track of the index of the selected commit to use when sync latest is false. */
const selectedCommitIndexStateAtom = atom<number>(0);

/**
 * Index of the currently selected commit in the commit history. This will be the latest
 * commit if syncLatestAtom is true, or the selected commit otherwise.
 */
export const selectedCommitIndexAtom = atom(
  async (get) => {
    const commitHistoryLength = (await get(commitHistoryAtom)).length;
    if (commitHistoryLength === 0) {
      throw new Error(`Database ${await get(databaseNameAtom)} has no commits.`);
    }
    return get(syncLatestAtom)
      ? commitHistoryLength - 1
      : get(selectedCommitIndexStateAtom);
  },
  (_, set, selectedCommitIndex: number) =>
    set(selectedCommitIndexStateAtom, selectedCommitIndex),
);
