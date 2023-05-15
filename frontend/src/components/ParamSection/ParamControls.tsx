import { startTransition } from "react";
import { useAtom, useSetAtom } from "jotai";
import { Box, FormGroup, FormControlLabel, Switch, Button } from "@mui/material";
import { syncLatestAtom, commitSelectFrozenAtom } from "@/atoms/commitSelect";
import { roundAtom, collapseAtom, editModeAtom, editedDataAtom } from "@/atoms/paramList";

const subControlsSx = {
  display: "flex",
  alignItems: "center",
  columnGap: 2.25,
};

const buttonSx = {
  px: 1.25,
  py: 0.75,
  whiteSpace: "nowrap",
};

/** Controls for the parameter section. */
export default function ParamControls() {
  const [round, toggleRound] = useAtom(roundAtom);
  const collapseAll = useSetAtom(collapseAtom);
  const [editMode, toggleEditMode] = useAtom(editModeAtom);
  const setSyncLatest = useSetAtom(syncLatestAtom);
  const setCommitSelectFrozen = useSetAtom(commitSelectFrozenAtom);
  const resetEditedData = useSetAtom(editedDataAtom);

  const toggleEditModeAndReset = () => {
    startTransition(() => {
      setCommitSelectFrozen(!editMode);
      setSyncLatest(false);
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
            <Button variant="contained" sx={buttonSx} onClick={toggleEditModeAndReset}>
              Cancel
            </Button>
            <Button variant="contained" sx={buttonSx}>
              Commit
            </Button>
          </>
        ) : (
          <Button variant="contained" sx={buttonSx} onClick={toggleEditModeAndReset}>
            Edit
          </Button>
        )}
      </Box>
    </>
  );
}
