import deepEqual from "fast-deep-equal";
import { useAtom, useSetAtom } from "jotai";
import { startTransition, useTransition, Suspense } from "react";
import { Box, FormGroup, FormControlLabel, Switch, Button } from "@mui/material";
import { originalDataLoadableAtom } from "@/atoms/api";
import { selectedCommitIndexAtom } from "@/atoms/commitSelect";
import {
  roundAtom,
  collapseAtom,
  editModeAtom,
  editedDataLoadableAtom,
  commitDialogOpenAtom,
} from "@/atoms/paramList";
import CommitDialog from "./CommitDialog";

const subControlsSx = {
  display: "flex",
  alignItems: "center",
  columnGap: 2.25,
};

/** Controls for the parameter section. */
export default function ParamControls() {
  const [cancelingEditMode, startCancelTransition] = useTransition();

  const [round, toggleRound] = useAtom(roundAtom);
  const [editMode, setEditMode] = useAtom(editModeAtom);
  const [originalDataLoadable] = useAtom(originalDataLoadableAtom);
  const [editedDataLoadable] = useAtom(editedDataLoadableAtom);

  const setSelectedCommitIndex = useSetAtom(selectedCommitIndexAtom);
  const collapseAll = useSetAtom(collapseAtom);
  const setCommitDialogOpen = useSetAtom(commitDialogOpenAtom);

  const startEditMode = () =>
    startTransition(() => {
      // Sync the underlying selected commit index with the latest index if sync latest is
      // true.
      setSelectedCommitIndex({ type: "sync" });
      setEditMode(true);
    });

  const cancelEditMode = () => {
    const dataEdited =
      originalDataLoadable.state === "hasData" &&
      editedDataLoadable.state === "hasData" &&
      !deepEqual(originalDataLoadable.data, editedDataLoadable.data);

    // If the data has been edited, prompt the user before exiting edit mode (and
    // discarding their changes). See
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm.
    if (
      !dataEdited ||
      confirm("You have unsaved changes. Do you want to discard them?")
    ) {
      startCancelTransition(() => {
        setCommitDialogOpen(false);
        setEditMode(false);
      });
    }
  };

  const openCommitDialog = () => {
    if (!cancelingEditMode) {
      // Only open if not in the process of canceling edit mode
      setCommitDialogOpen(true);
    }
  };

  return (
    <>
      <Box sx={subControlsSx}>
        <FormGroup>
          <FormControlLabel
            data-testid="round-switch"
            sx={{ ml: 0 }}
            control={<Switch />}
            label="Round"
            labelPlacement="start"
            checked={round}
            onChange={toggleRound}
          />
        </FormGroup>
        <Button
          data-testid="collapse-all-button"
          variant="contained"
          onClick={collapseAll}
        >
          Collapse all
        </Button>
      </Box>
      <Box sx={subControlsSx}>
        {editMode ? (
          <>
            <Button
              data-testid="cancel-edit-button"
              key="cancel"
              variant="contained"
              onClick={cancelEditMode}
            >
              Cancel
            </Button>
            <Button
              data-testid="open-commit-dialog-button"
              key="commit"
              variant="contained"
              onClick={openCommitDialog}
            >
              Commit
            </Button>
          </>
        ) : (
          <Button
            data-testid="edit-button"
            key="edit"
            variant="contained"
            onClick={startEditMode}
          >
            Edit
          </Button>
        )}
      </Box>
      <Suspense>
        <CommitDialog />
      </Suspense>
    </>
  );
}
