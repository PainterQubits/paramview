import { atom } from "jotai";
import { CommitEntry, Data } from "@/types";
import { requestData } from "@/utils/api";
import { selectedCommitIndexAtom } from "@/atoms/commitSelect";

/**
 * Request for the database name that also sets the page title as a side effect. This
 * request is defined outside of databaseNameAtom so the page title is set whether or
 * not the atom is used.
 */
const databaseNameRequest = requestData<string>("api/database-name").then((name) => {
  document.title = name;
  return name;
});

/** Database name retrieved from the server. */
export const databaseNameAtom = atom(() => databaseNameRequest);

/** Primitive atom to store the value of commitHistorySyncAtom. */
const commitHistorySyncStateAtom = atom<CommitEntry[] | null>(null);

/**
 * Synchronous atom containing the commit history retrieved from the server, or null while
 * it is loading. The purpose of this atom is mainly so that selectedCommitIndexAtom can
 * be updated synchronously.
 */
export const commitHistorySyncAtom = atom((get) => get(commitHistorySyncStateAtom));

/**
 * Primitive atom to store the state of commitHistoryAtom. Initializing to an infinite
 * promise means the commit history will be loading until this atom is set.
 */
const commitHistoryStateAtom = atom(new Promise<CommitEntry[]>(() => {}));

/**
 * Commit history retrieved from the server.
 *
 * The set function requests the latest commit history, updates this atom to the
 * asynchronous request, and updates commitHistorySyncAtom once it is loaded.
 */
export const commitHistoryAtom = atom(
  (get) => get(commitHistoryStateAtom),
  (_, set) => {
    const commitHistoryRequest = (async () => {
      const newCommitHistory = await requestData<CommitEntry[]>("api/commit-history");
      set(commitHistorySyncStateAtom, newCommitHistory);
      return newCommitHistory;
    })();

    set(commitHistoryStateAtom, commitHistoryRequest);
  },
);

/** Original (i.e. unedited) data for the currently selected commit. */
export const originalDataAtom = atom(async (get) => {
  const commitHistory = await get(commitHistoryAtom);
  const selectedCommitIndex = get(selectedCommitIndexAtom);
  return requestData<Data>(`api/data/${commitHistory[selectedCommitIndex].id}`);
});
