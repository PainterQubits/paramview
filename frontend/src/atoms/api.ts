import { atom } from "jotai";
import { CommitEntry, Data } from "@/types";
import { requestData } from "@/utils/api";
import { selectedCommitIndexAtom } from "@/atoms/commitSelect";

const databaseName = requestData<string>("api/database-name").then((name) => {
  document.title = name;
  return name;
});

/** Database name retrieved from the server. */
export const databaseNameAtom = atom(async () => databaseName);

const commitHistoryStateAtom = atom(requestData<CommitEntry[]>("api/commit-history"));

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
