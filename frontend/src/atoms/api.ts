import { atom } from "jotai";
import { CommitEntry } from "@/types";
import { requestData } from "@/utils/api";

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
