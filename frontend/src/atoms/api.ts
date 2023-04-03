import { atom } from "jotai";
import { CommitEntry } from "@/types";
import { requestData } from "@/utils/api";

/** Commit history retrieved from the server. */
export const commitHistoryAtom = atom(() => {
  return requestData<CommitEntry[]>("api/commit-history");
});
