import { startTransition } from "react";
import { useAtom, useSetAtom } from "jotai";
import { Box, FormGroup, FormControlLabel, Switch, Button } from "@mui/material";
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

/** Controls for the parameter section. */
export default function ParamControls() {
  const [round, toggleRound] = useAtom(roundAtom);
  const collapseAll = useSetAtom(collapseAtom);
  const [editMode, toggleEditMode] = useAtom(editModeAtom);
  const setCommitDialogOpen = useSetAtom(commitDialogOpenAtom);
  const resetEditedData = useSetAtom(editedDataAtom);

  const resetAndToggleEditMode = () => {
    startTransition(() => {
      resetEditedData();
      toggleEditMode();
    });
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
          sx={buttonSx}
          onClick={collapseAll}
        >
          Collapse all
        </Button>
      </Box>
      <Box sx={subControlsSx}>
        {editMode ? (
          <>
            <Button variant="contained" sx={buttonSx} onClick={resetAndToggleEditMode}>
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={buttonSx}
              onClick={() => setCommitDialogOpen(true)}
            >
              Commit
            </Button>
            <CommitDialog />
          </>
        ) : (
          <Button variant="contained" sx={buttonSx} onClick={resetAndToggleEditMode}>
            Edit
          </Button>
        )}
      </Box>
    </>
  );
}
