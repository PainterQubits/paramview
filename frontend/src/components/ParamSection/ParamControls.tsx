import { startTransition } from "react";
import { useAtom, useSetAtom } from "jotai";
import { Box, FormGroup, FormControlLabel, Switch, Button } from "@mui/material";
import { roundAtom, collapseAtom, editModeAtom, editedDataAtom } from "@/atoms/paramList";
import CommitDialog from "./CommitDialog";

const subControlsSx = {
  display: "flex",
  alignItems: "center",
  columnGap: 2.25,
};

/** Controls for toggling edit mode and opening the commit dialog. */
function CommitControls() {
  const [editMode, setEditMode] = useAtom(editModeAtom);
  const editedDataDispatch = useSetAtom(editedDataAtom);

  const startEditMode = () =>
    startTransition(() => {
      editedDataDispatch({ type: "reset" });
      setEditMode(true);
    });

  const endEditMode = () => startTransition(() => setEditMode(false));

  return (
    <Box sx={subControlsSx}>
      {editMode ? (
        <>
          <Button key="cancel" variant="contained" onClick={endEditMode}>
            Cancel
          </Button>
          <CommitDialog key="commit" />
        </>
      ) : (
        <Button key="edit" variant="contained" onClick={startEditMode}>
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
          onClick={collapseAll}
        >
          Collapse all
        </Button>
      </Box>
      <CommitControls />
    </>
  );
}
