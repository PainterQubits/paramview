import { io } from "socket.io-client";
import { useSetAtom } from "jotai";
import { startTransition, useEffect } from "react";
import { commitHistoryAtom } from "@/atoms/api";

/** Set up SocketIO to sync database changes. */
export default function useSocketIO() {
  const updateCommitHistory = useSetAtom(commitHistoryAtom);

  useEffect(() => {
    const socket = io({
      // Prevent SocketIO from disconnecting on beforeunload. (If this was the default
      // value of true, then if the user tries to leave the page with unsaved changes and
      // chooses not to leave, database changes would no longer sync. See
      // useBeforeUnload.ts for usage of the beforeunload event in this app.)
      closeOnBeforeunload: false,
    });

    /** Actions to perform when the database may have been updated. */
    const databaseUpdate = () => {
      startTransition(updateCommitHistory);
    };

    // Trigger an update when the WebSocket connection is established, when there is a
    // connection error, when disconnected, and when the database is updated.
    socket.on("connect", databaseUpdate);
    socket.on("connect_error", databaseUpdate);
    socket.on("disconnect", databaseUpdate);
    socket.on("database_update", databaseUpdate);

    return () => {
      socket.disconnect();
    };
  }, [updateCommitHistory]);
}
