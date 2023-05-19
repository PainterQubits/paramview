import { io } from "socket.io-client";
import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { commitHistoryAtom } from "@/atoms/api";

/**
 * Set up SocketIO. This component does not render anything, but the SocketIO event
 * handlers need to be within a component in order to update atoms.
 */
export default function SocketIO() {
  const updateCommitHistory = useSetAtom(commitHistoryAtom);

  useEffect(() => {
    const socket = io();

    // Trigger an update when the WebSocket connection is established, when there is a
    // connection error, when disconnected, and when the database is updated.
    socket.on("connect", updateCommitHistory);
    socket.on("connect_error", updateCommitHistory);
    socket.on("disconnect", updateCommitHistory);
    socket.on("database_update", updateCommitHistory);

    return () => {
      socket.disconnect();
    };
  }, [updateCommitHistory]);

  return null;
}
