import { atom } from "jotai";
import { CommitEntry, Data } from "@/types";
import { requestData } from "@/utils/api";
import { selectedCommitIndexAtom } from "@/atoms/commitSelect";

/**
 * Request for the database name that also sets the page title as a side effect. This
 * request is defined outside of databaseNameAtom so the page title is set whether or
 * not the atom is used.
 */
const databaseName = requestData<string>("api/database-name").then((name) => {
  document.title = name;
  return name;
});

/** Database name retrieved from the server. */
export const databaseNameAtom = atom(() => databaseName);

/** Primitive atom to store the value of the commit history. */
const commitHistoryStateAtom = atom<CommitEntry[] | null>(null);

/**
 * Commit history retrieved from the server. The set function loads the commit history
 * asynchronously and then sets the value of the atom.
 */
export const commitHistoryAtom = atom(
  (get) => get(commitHistoryStateAtom),
  (_, set) =>
    requestData<CommitEntry[]>("api/commit-history").then((newCommitHistory) =>
      set(commitHistoryStateAtom, newCommitHistory),
    ),
);

// export const commitHistoryAsyncAtom = atom(commitHistoryAtom === null ? )

/** Original (i.e. unedited) data for the currently selected commit. */
export const originalDataAtom = atom(async (get) => {
  const commitHistory = get(commitHistoryAtom);

  if (commitHistory === null) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return new Promise<Data>(() => {});
  }

  const selectedCommitIndex = get(selectedCommitIndexAtom);
  return requestData<Data>(`api/data/${commitHistory[selectedCommitIndex].id}`);
});
