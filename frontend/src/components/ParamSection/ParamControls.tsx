import { startTransition } from "react";
import { useAtom, useSetAtom } from "jotai";
import { Box, FormGroup, FormControlLabel, Switch, Button } from "@mui/material";
import { roundAtom, collapseAtom, editModeAtom } from "@/atoms/paramList";
import CommitDialog from "./CommitDialog";

const subControlsSx = {
  display: "flex",
  alignItems: "center",
  columnGap: 2.25,
};

/** Controls for the parameter section. */
export default function ParamControls() {
  const [round, toggleRound] = useAtom(roundAtom);
  const collapseAll = useSetAtom(collapseAtom);
  const [editMode, setEditMode] = useAtom(editModeAtom);

  /**
   * Returns a function that sets edit mode to the given value within a React
   * transition.
   */
  const setEditModeFunction = (newEditMode: boolean) => () =>
    startTransition(() => setEditMode(newEditMode));

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
            <Button key="cancel" variant="contained" onClick={setEditModeFunction(false)}>
              Cancel
            </Button>
            <CommitDialog key="commit" />
          </>
        ) : (
          <Button key="edit" variant="contained" onClick={setEditModeFunction(true)}>
            Edit
          </Button>
        )}
      </Box>
    </>
  );
}
