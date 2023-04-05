import { atom } from "jotai";
import { CommitEntry, Data } from "@/types";
import { requestData } from "@/utils/api";
import { selectedCommitIndexAtom } from "@/atoms/commitSelect";

/** Database name retrieved from the server. */
export const databaseNameAtom = atom(async () => {
  const databaseName = await requestData<string>("api/database-name");
  document.title = databaseName;
  return databaseName;
});

/** Commit history retrieved from the server. */
export const commitHistoryAtom = atom(() =>
  requestData<CommitEntry[]>("api/commit-history"),
);

/** Data for the currently selected commit. */
export const dataAtom = atom(async (get) => {
  const commitHistory = await get(commitHistoryAtom);
  const selectedCommitIndex = await get(selectedCommitIndexAtom);
  return requestData<Data>(`api/data/${commitHistory[selectedCommitIndex].id}`);
});
