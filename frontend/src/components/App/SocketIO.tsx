import { io } from "socket.io-client";
import { useState, useEffect } from "react";
import { useSetAtom } from "jotai";
import { commitHistoryAtom } from "@/atoms/api";

const notRunningMessage = "\n\nPlease check that paramview is running.";

const socket = io();

export default function SocketIO() {
  const setCommitHistory = useSetAtom(commitHistoryAtom);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (error) {
      socket.disconnect(); // Stop trying to connect
      throw Error("Could not connect to ParamView backend." + notRunningMessage);
    }
  }, [error]);

  useEffect(() => {
    socket.on("connect_error", () => setError(true));

    socket.on("disconnect", () => setError(true));

    socket.on("commit history", () => {
      // setCommitHistory();
      console.log("Commit history received.");
    });

    return () => {
      socket.removeAllListeners();
    };
  });

  return null;
}
