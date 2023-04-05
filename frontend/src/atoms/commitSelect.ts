import { atom } from "jotai";
import { databaseNameAtom, commitHistoryAtom } from "@/atoms/api";

/** Whether to sync the current commit index with the latest commit. */
export const syncLatestAtom = atom(true);

/** Keeps track of the selected commit to use when sync latest is false. */
const commitIndexAtom = atom(0);

/** Currently selected index in the commit history. */
export const selectedCommitIndexAtom = atom(
  async (get) => {
    const commitHistoryLength = (await get(commitHistoryAtom)).length;
    if (commitHistoryLength === 0) {
      throw Error(`Database ${await get(databaseNameAtom)} has no commits.`);
    }
    return get(syncLatestAtom) ? commitHistoryLength - 1 : get(commitIndexAtom);
  },
  (_, set, newCommit: number) => set(commitIndexAtom, newCommit),
);
