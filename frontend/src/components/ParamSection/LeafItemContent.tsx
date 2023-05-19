import { useState, useEffect, useMemo, useCallback } from "react";
import { useAtom } from "jotai";
import { Replay } from "@mui/icons-material";
import { Box, Typography, TextField, MenuItem, IconButton } from "@mui/material";
import { Path, LeafType, Leaf } from "@/types";
import { leafToString, leafToInput, parseLeaf, getData, setData } from "@/utils/data";
import { isLeaf, getLeafType } from "@/utils/type";
import { originalDataAtom } from "@/atoms/api";
import { roundAtom, editModeAtom, editedDataAtom } from "@/atoms/paramList";

const leafItemContentSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flex: 1,
  pl: "24px",
  pr: 2,
  minHeight: "28px",
  background: "white",
};

type LeafItemReadModeProps = {
  /** Leaf value to display. */
  leaf: Leaf;
};

/** Displays the string value of the given leaf. */
function LeafItemReadMode({ leaf }: LeafItemReadModeProps) {
  const [round] = useAtom(roundAtom);

  return <Typography align="right">{leafToString(leaf, round)}</Typography>;
}

/** Input for entering a new leaf value. */
type LeafItemEditModeProps = {
  /** Edited leaf value that is used as the initial value. */
  editedLeaf: Leaf;
  /** Path to the data this item represents. */
  path: Path;
};

function LeafItemEditMode({ editedLeaf, path }: LeafItemEditModeProps) {
  const [originalRootData] = useAtom(originalDataAtom);
  const [editedRootData, editedDataDispatch] = useAtom(editedDataAtom);

  const originalLeaf = useMemo(() => {
    const originalData = getData(originalRootData, path);

    if (!isLeaf(originalData)) {
      throw new Error("original data for leaf input is not a leaf");
    }

    return originalData;
  }, [originalRootData, path]);

  const {
    leafType: originalLeafType,
    input: originalInput,
    unitInput: originalUnitInput,
  } = useMemo(
    () => ({ leafType: getLeafType(originalLeaf), ...leafToInput(originalLeaf) }),
    [originalLeaf],
  );

  const {
    leafType: editedLeafType,
    input: editedInput,
    unitInput: editedUnitInput,
  } = useMemo(
    () => ({ leafType: getLeafType(editedLeaf), ...leafToInput(editedLeaf) }),
    [editedLeaf],
  );

  const [leafType, setLeafType] = useState(editedLeafType);
  const [input, setInput] = useState(editedInput);
  const [unitInput, setUnitInput] = useState(editedUnitInput);

  const setEditedData = useCallback(
    (value: Leaf) => {
      if (path.length === 0) {
        editedDataDispatch({ type: "set", value });
      } else {
        setData(editedRootData, path, value);
      }
    },
    [editedRootData, path, editedDataDispatch],
  );

  useEffect(() => {
    const parsedLeaf = parseLeaf(leafType, input, unitInput);
    setEditedData(parsedLeaf !== undefined ? parsedLeaf : originalLeaf);
  }, [leafType, input, unitInput, originalLeaf, setEditedData]);

  const changedInput = input !== originalInput;
  const changedUnitInput = unitInput !== originalUnitInput;
  const changedLeafType = leafType !== originalLeafType;

  return (
    <Box sx={{ display: "flex", columnGap: 1 }}>
      <TextField
        variant="standard"
        sx={{
          ml: 1,
          width: leafType === LeafType.Quantity ? "calc(14rem - 8px - 6ch)" : "14rem",
        }}
        inputProps={{ sx: [{ pt: "2.5px", pb: "2.5px" }] }}
        select={leafType === LeafType.Boolean}
        disabled={leafType === LeafType.Null}
        type={leafType === LeafType.Datetime ? "datetime-local" : undefined}
        value={input}
        error={parseLeaf(leafType, input, "u") === undefined}
        focused={changedInput}
        color={changedInput ? "success" : undefined}
        onChange={({ target: { value } }) => setInput(value)}
      >
        <MenuItem value="True">True</MenuItem>
        <MenuItem value="False">False</MenuItem>
      </TextField>
      {leafType === LeafType.Quantity && (
        <TextField
          variant="standard"
          sx={{ width: "6ch" }}
          inputProps={{ sx: [{ pt: "2.5px", pb: "2.5px" }] }}
          value={unitInput}
          error={parseLeaf(leafType, "0", unitInput) === undefined}
          focused={changedUnitInput}
          color={changedUnitInput ? "success" : undefined}
          onChange={({ target: { value } }) => setUnitInput(value)}
        />
      )}
      <TextField
        select
        variant="standard"
        sx={{ width: "90px" }}
        inputProps={{ sx: [{ pt: "2.5px", pb: "2.5px" }] }}
        value={leafType}
        focused={changedLeafType}
        color={changedLeafType ? "success" : undefined}
        onChange={({ target: { value } }) => {
          const newLeafType = value as unknown as LeafType;

          if (newLeafType === LeafType.Boolean) {
            setInput(input.toLowerCase() === "true" ? "True" : "False");
          } else if (newLeafType === LeafType.Null) {
            setInput("None");
          }

          setLeafType(newLeafType);
        }}
      >
        <MenuItem value={LeafType.Number}>int/float</MenuItem>
        <MenuItem value={LeafType.Boolean}>bool</MenuItem>
        <MenuItem value={LeafType.String}>str</MenuItem>
        <MenuItem value={LeafType.Null}>None</MenuItem>
        <MenuItem value={LeafType.Quantity}>Quantity</MenuItem>
        <MenuItem value={LeafType.Datetime}>datetime</MenuItem>
      </TextField>
      <IconButton
        sx={{ width: "1.75rem", height: "1.75rem" }}
        size="small"
        onClick={() => {
          setLeafType(originalLeafType);
          setInput(originalInput);
          setUnitInput(originalUnitInput);
        }}
      >
        <Replay fontSize="small" />
      </IconButton>
    </Box>
  );
}

type LeafItemContentProps = {
  /** Name to display. */
  name: string;
  /** Leaf value to display, or the edited leaf value in edit mode. */
  leaf: Leaf;
  /** Path to the data this item represents. */
  path: Path;
};

/** Item content for a Leaf. */
export default function LeafItemContent({ name, leaf, path }: LeafItemContentProps) {
  const [editMode] = useAtom(editModeAtom);

  return (
    <Box sx={leafItemContentSx}>
      <Typography>{name}</Typography>
      {editMode ? (
        <LeafItemEditMode editedLeaf={leaf} path={path} />
      ) : (
        <LeafItemReadMode leaf={leaf} />
      )}
    </Box>
  );
}
