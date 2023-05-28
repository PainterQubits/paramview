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

/**
 * Primitive atom to store the state of commitHistoryAtom. Initializing to an infinite
 * promise means the commit history will be loading until this atom is set.
 */
const commitHistoryStateAtom = atom(new Promise<CommitEntry[]>(() => {}));

/**
 * Commit history retrieved from the server, and a function that updates this atom to the
 * latest latest commit history.
 */
export const commitHistoryAtom = atom(
  (get) => get(commitHistoryStateAtom),
  (_, set) =>
    set(commitHistoryStateAtom, requestData<CommitEntry[]>("api/commit-history")),
);

/** Original (i.e. unedited) data for the currently selected commit. */
export const originalDataAtom = atom(async (get) => {
  const commitHistory = await get(commitHistoryAtom);
  const selectedCommitIndex = await get(selectedCommitIndexAtom);
  return requestData<Data>(`api/data/${commitHistory[selectedCommitIndex].id}`);
});
