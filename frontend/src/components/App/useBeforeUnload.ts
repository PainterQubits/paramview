import deepEqual from "fast-deep-equal";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { originalDataLoadableAtom } from "@/atoms/api";
import {
  editModeAtom,
  editedDataLoadableAtom,
  commitMessageAtom,
  commitDialogOpenAtom,
} from "@/atoms/paramList";

/** Warn the user before closing the page. */
function preventUnload(e: BeforeUnloadEvent) {
  e.preventDefault();
  return (e.returnValue = "");
}

/**
 * Set up the beforeunload event to warn the user when closing the page if there are any
 * unsaved changes. See
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event for more
 * information.
 */
export default function useBeforeUnload() {
  const [editMode] = useAtom(editModeAtom);
  const [originalDataLoadable] = useAtom(originalDataLoadableAtom);
  const [editedDataLoadable] = useAtom(editedDataLoadableAtom);
  const [commitDialogOpen] = useAtom(commitDialogOpenAtom);
  const [commitMessage] = useAtom(commitMessageAtom);

  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      // If we are not in edit mode, allow the page to close
      if (!editMode) return;

      // If the commit dialog is open and a message has been typed, warn before closing
      if (commitDialogOpen && commitMessage !== "") {
        return preventUnload(e);
      }

      // If the data has been edited, warn before closing
      if (
        originalDataLoadable.state === "hasData" &&
        editedDataLoadable.state === "hasData" &&
        !deepEqual(originalDataLoadable.data, editedDataLoadable.data)
      ) {
        return preventUnload(e);
      }
    };

    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  });
}
