import { io } from "socket.io-client";
import { startTransition, useEffect } from "react";
import { useSetAtom } from "jotai";
import { commitHistoryAtom } from "@/atoms/api";

const socket = io();

/**
 * Set up SocketIO. This component does not render anything, but the SocketIO event
 * handlers need to be within a component in order to update atoms.
 */
export default function SocketIO() {
  const updateCommitHistory = useSetAtom(commitHistoryAtom);

  /** Actions to perform when the database may have been updated. */
  const databaseUpdate = () => startTransition(updateCommitHistory);

  useEffect(() => {
    // Trigger an update when the WebSocket connection is established, when there is a
    // connection error, when disconnected, and when the database is updated.
    socket.on("connect", databaseUpdate);
    socket.on("connect_error", databaseUpdate);
    socket.on("disconnect", databaseUpdate);
    socket.on("database_update", databaseUpdate);

    return () => {
      // Remove listeners when this component is unmounted.
      socket.removeAllListeners();
    };
  });

  return null;
}
