import { atom } from "jotai";
import { loadable } from "jotai/utils";
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

/** Request the commit history. */
const requestCommitHistory = async () => requestData<CommitEntry[]>("api/commit-history");

/**
 * The request for the initial commit history, used as the initial value for
 * commitHistoryStateAtom. Initiating the request here starts the request earlier (before
 * the atom is loaded), slightly improving page load time.
 */
const initialCommitHistory = requestCommitHistory();

/**
 * Primitive atom to store the state of commitHistoryAtom. Initializing to an infinite
 * promise means the commit history will be loading until this atom is set.
 */
const commitHistoryStateAtom = atom(initialCommitHistory);

/**
 * Commit history retrieved from the server, and a function that updates this atom to the
 * latest latest commit history.
 */
export const commitHistoryAtom = atom(
  async (get) => {
    const commitHistory = await get(commitHistoryStateAtom);

    if (commitHistory.length === 0) {
      const databaseName = await get(databaseNameAtom);
      throw new RangeError(`Database ${databaseName} has no commits.`);
    }

    return commitHistory;
  },
  (_, set) => set(commitHistoryStateAtom, requestCommitHistory()),
);

/** Original (i.e. unedited) data for the currently selected commit. */
export const originalDataAtom = atom(async (get) => {
  const commitHistory = await get(commitHistoryAtom);
  const selectedCommitIndex = await get(selectedCommitIndexAtom);
  return requestData<Data>(`api/data/${commitHistory[selectedCommitIndex].id}`);
});

/**
 * Synchronous atom containing the most recently loaded original data, intended to be used
 * for testing against the edited data to synchronously check if it has changed.
 */
export const originalDataLoadableAtom = loadable(originalDataAtom);

/** Data for the latest commit. */
export const latestDataAtom = atom(async (get) => {
  const commitHistory = await get(commitHistoryAtom);
  return requestData<Data>(`api/data/${commitHistory[commitHistory.length - 1].id}`);
});
