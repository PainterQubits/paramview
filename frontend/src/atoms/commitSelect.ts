import { atom } from "jotai";
import { commitHistoryAtom } from "@/atoms/api";

/** Whether to sync the current commit index with the latest commit. */
export const syncLatestAtom = atom(true);

/** Keeps track of the selected commit to use when sync latest is false. */
const commitAtom = atom(0);

/** Currently selected index in the commit history. */
export const selectedCommitAtom = atom(
  (get) => (get(syncLatestAtom) ? get(commitHistoryAtom).length - 1 : get(commitAtom)),
  (_, set, newCommit: number) => set(commitAtom, newCommit),
);
