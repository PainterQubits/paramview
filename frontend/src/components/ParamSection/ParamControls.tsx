import { startTransition, Suspense } from "react";
import { useAtom, useSetAtom } from "jotai";
import { Box, FormGroup, FormControlLabel, Switch, Button } from "@mui/material";
import { commitHistoryAtom } from "@/atoms/api";
import { syncLatestAtom, selectedCommitIndexAtom } from "@/atoms/commitSelect";
import {
  roundAtom,
  collapseAtom,
  editModeAtom,
  editedDataAtom,
  commitDialogOpenAtom,
} from "@/atoms/paramList";
import CommitDialog from "./CommitDialog";

const subControlsSx = {
  display: "flex",
  alignItems: "center",
  columnGap: 2.25,
};

const buttonSx = {
  px: 1.4,
  whiteSpace: "nowrap",
};

function CommitControls() {
  const [commitHistory] = useAtom(commitHistoryAtom);
  const [syncLatest] = useAtom(syncLatestAtom);
  const setSelectedCommitIndex = useSetAtom(selectedCommitIndexAtom);

  const [editMode, toggleEditMode] = useAtom(editModeAtom);
  const setCommitDialogOpen = useSetAtom(commitDialogOpenAtom);
  const editedDataDispatch = useSetAtom(editedDataAtom);

  const resetAndToggleEditMode = () => {
    startTransition(() => {
      if (syncLatest) {
        setSelectedCommitIndex(commitHistory.length - 1);
      }
      editedDataDispatch({ type: "reset" });
      toggleEditMode();
    });
  };

  return (
    <Box sx={subControlsSx}>
      {editMode ? (
        <>
          <Button
            key="cancel"
            variant="contained"
            sx={buttonSx}
            onClick={resetAndToggleEditMode}
          >
            Cancel
          </Button>
          <Button
            key="commit"
            variant="contained"
            sx={buttonSx}
            onClick={() => setCommitDialogOpen(true)}
          >
            Commit
          </Button>
          <CommitDialog />
        </>
      ) : (
        <Button
          key="edit"
          variant="contained"
          sx={buttonSx}
          onClick={resetAndToggleEditMode}
        >
          Edit
        </Button>
      )}
    </Box>
  );
}

/** Controls for the parameter section. */
export default function ParamControls() {
  const [round, toggleRound] = useAtom(roundAtom);
  const collapseAll = useSetAtom(collapseAtom);

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
          sx={buttonSx}
          onClick={collapseAll}
        >
          Collapse all
        </Button>
      </Box>
      <Suspense
        fallback={
          <Button variant="contained" sx={buttonSx}>
            Edit
          </Button>
        }
      >
        <CommitControls />
      </Suspense>
    </>
  );
}
