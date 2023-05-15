import { startTransition } from "react";
import { useAtom, useSetAtom } from "jotai";
import { Box, FormGroup, FormControlLabel, Switch, Button } from "@mui/material";
import { roundAtom, collapseAtom, editModeAtom, editedDataAtom } from "@/atoms/paramList";

const paramControlsSx = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  columnGap: 2.25,
};

/** Controls for the parameter section. */
export default function ParamControls() {
  const [round, toggleRound] = useAtom(roundAtom);
  const collapseAll = useSetAtom(collapseAtom);
  const [editMode, toggleEditMode] = useAtom(editModeAtom);
  const resetEditedData = useSetAtom(editedDataAtom);

  return (
    <Box sx={paramControlsSx}>
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
        sx={{ px: 1.25, py: 0.75, whiteSpace: "nowrap" }}
        onClick={collapseAll}
      >
        Collapse all
      </Button>
      <Button
        variant="contained"
        sx={{ px: 1.25, py: 0.75, minWidth: "76px" }}
        onClick={() =>
          startTransition(() => {
            resetEditedData();
            toggleEditMode();
          })
        }
      >
        {editMode ? "Cancel" : "Edit"}
      </Button>
    </Box>
  );
}
