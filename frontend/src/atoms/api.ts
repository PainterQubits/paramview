import { atom } from "jotai";
import { CommitEntry } from "@/types";

/** Commit history retrieved from the server. */
export const commitHistoryAtom = atom(() => {
  const now_timestamp = Date.now() / 1000;

  const commitHistory: CommitEntry[] = [];

  for (let i = 0; i < 20000; i++) {
    commitHistory.push({
      id: i + 1,
      message: `Commit message`,
      timestamp: now_timestamp - (999 - i) * 1000,
    });
  }

  return commitHistory;
});
