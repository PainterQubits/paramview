import { atom } from "jotai";
import { CommitEntry } from "@/types";

/** Commit history retrieved from the server. */
export const commitHistoryAtom = atom((): CommitEntry[] => {
  return [
    { id: 1, message: "Initial commit", timestamp: 1234567 },
    { id: 2, message: "Second commit", timestamp: 12345678 },
    { id: 3, message: "Third commit", timestamp: 123456789 },
  ];
});
