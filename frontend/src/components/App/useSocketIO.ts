import { io } from "socket.io-client";
import { useSetAtom } from "jotai";
import { startTransition, useEffect } from "react";
import { commitHistoryAtom } from "@/atoms/api";

/** Set up SocketIO to sync database changes. */
export default function SocketIO() {
  const updateCommitHistory = useSetAtom(commitHistoryAtom);

  useEffect(() => {
    const socket = io();

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

  return null;
}
