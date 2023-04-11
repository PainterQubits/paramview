import { io } from "socket.io-client";
import { startTransition, useEffect } from "react";
import { useSetAtom } from "jotai";
import { commitHistoryAtom } from "@/atoms/api";

const socket = io();

export default function SocketIO() {
  const updateCommitHistory = useSetAtom(commitHistoryAtom);

  const update = () => startTransition(updateCommitHistory);

  useEffect(() => {
    socket.on("connect", update);

    socket.on("connect_error", update);

    socket.on("disconnect", update);

    socket.on("database_update", update);

    return () => {
      socket.removeAllListeners();
    };
  });

  return null;
}
