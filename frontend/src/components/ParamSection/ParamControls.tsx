import { useAtom, useSetAtom } from "jotai";
import { Box, FormGroup, FormControlLabel, Switch, Button } from "@mui/material";
import { roundAtom, collapseAtom } from "@/atoms/paramList";

const paramControlsSx = {
  display: "flex",
  flexWrap: "wrap",
  columnGap: 2.25,
};

/** Controls for the parameter section. */
export default function ParamControls() {
  const [round, toggleRound] = useAtom(roundAtom);

  const collapseAll = useSetAtom(collapseAtom);

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
        sx={{ whiteSpace: "nowrap" }}
        onClick={collapseAll}
      >
        Collapse all
      </Button>
    </Box>
  );
}
