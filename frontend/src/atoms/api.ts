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

/**
 * Primitive atom to store value of the commit history. Initializing to an infinite
 * promise means the commit history will load until commitHistoryAtom is set.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
const commitHistoryStateAtom = atom(new Promise<CommitEntry[]>(() => {}));

/** Commit history retrieved from the server. */
export const commitHistoryAtom = atom(
  (get) => get(commitHistoryStateAtom),
  (_, set) =>
    set(commitHistoryStateAtom, requestData<CommitEntry[]>("api/commit-history")),
);

/** Data for the currently selected commit. */
export const dataAtom = atom(async (get) => {
  const commitHistory = await get(commitHistoryAtom);
  const selectedCommitIndex = await get(selectedCommitIndexAtom);
  return requestData<Data>(`api/data/${commitHistory[selectedCommitIndex].id}`);
});
