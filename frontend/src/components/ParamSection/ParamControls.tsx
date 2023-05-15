import { startTransition, useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import { Box, FormGroup, FormControlLabel, Switch, Button } from "@mui/material";
import { roundAtom, collapseAtom, editModeAtom, editedDataAtom } from "@/atoms/paramList";

const subControlsSx = {
  display: "flex",
  alignItems: "center",
  columnGap: 2.25,
};

const buttonSx = {
  px: 1.25,
  py: 0.75,
};

/** Controls for the parameter section. */
export default function ParamControls() {
  const [round, toggleRound] = useAtom(roundAtom);
  const collapseAll = useSetAtom(collapseAtom);
  const [editMode, toggleEditMode] = useAtom(editModeAtom);
  const resetEditedData = useSetAtom(editedDataAtom);

  useEffect(resetEditedData, [resetEditedData, editMode]);

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
            <Button
              variant="contained"
              sx={buttonSx}
              onClick={() => startTransition(toggleEditMode)}
            >
              Cancel
            </Button>
            <Button variant="contained" sx={buttonSx}>
              Commit
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            sx={buttonSx}
            onClick={() => startTransition(toggleEditMode)}
          >
            Edit
          </Button>
        )}
      </Box>
    </>
  );
}
