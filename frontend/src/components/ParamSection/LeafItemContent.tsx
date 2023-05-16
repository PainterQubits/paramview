import { useState, useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import { Replay } from "@mui/icons-material";
import { Box, Typography, TextField, MenuItem, IconButton } from "@mui/material";
import { Path, LeafType, Leaf } from "@/types";
import { leafToString, leafToInput, parseLeaf, getData, setData } from "@/utils/data";
import { getLeafType } from "@/utils/type";
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
  /** Path to the data this item represents. */
  path: Path;
};

function LeafItemReadMode({ path }: LeafItemReadModeProps) {
  const [rootData] = useAtom(editedDataAtom);
  const [round] = useAtom(roundAtom);
  const leafValue = useMemo(() => getData(rootData, path) as Leaf, [rootData, path]);

  return <Typography align="right">{leafToString(leafValue, round)}</Typography>;
}

type LeafItemEditModeProps = {
  /** Path to the data this item represents. */
  path: Path;
};

function LeafItemEditMode({ path }: LeafItemEditModeProps) {
  const [originalRootData] = useAtom(originalDataAtom);
  const originalLeafValue = useMemo(
    () => getData(originalRootData, path) as Leaf,
    [originalRootData, path],
  );
  const originalLeafType = useMemo(
    () => getLeafType(originalLeafValue),
    [originalLeafValue],
  );
  const [originalInput, originalUnitInput] = useMemo(
    () => leafToInput(originalLeafValue),
    [originalLeafValue],
  );

  const [editedRootData] = useAtom(editedDataAtom);
  const editedLeafValue = useMemo(
    () => getData(editedRootData, path) as Leaf,
    [editedRootData, path],
  );
  const [editedLeafType, setEditedLeafType] = useState(() =>
    getLeafType(editedLeafValue),
  );
  const [editedInput, editedUnitInput] = useMemo(
    () => leafToInput(editedLeafValue),
    [editedLeafValue],
  );

  const [input, setInput] = useState(editedInput);
  const [unitInput, setUnitInput] = useState(editedUnitInput);

  useEffect(() => {
    const parsedLeaf = parseLeaf(input, unitInput, editedLeafType);
    if (parsedLeaf !== undefined) {
      setData(editedRootData, path, parsedLeaf);
    }
  }, [input, unitInput, editedLeafType, editedRootData, path]);

  const changedInput = input !== originalInput;
  const changedUnitInput = unitInput !== originalUnitInput;
  const changedType = editedLeafType !== originalLeafType;

  return (
    <Box sx={{ display: "flex", columnGap: 1 }}>
      <TextField
        variant="standard"
        sx={{
          ml: 1,
          width:
            editedLeafType === LeafType.Quantity ? "calc(14rem - 8px - 6ch)" : "14rem",
        }}
        inputProps={{ sx: [{ pt: "2.5px", pb: "2.5px" }] }}
        select={editedLeafType === LeafType.Boolean}
        disabled={editedLeafType === LeafType.Null}
        type={editedLeafType === LeafType.Datetime ? "datetime-local" : undefined}
        value={input}
        error={parseLeaf(input, "u", editedLeafType) === undefined}
        focused={changedInput}
        color={changedInput ? "success" : undefined}
        onChange={({ target: { value } }) => setInput(value)}
      >
        <MenuItem value="True">True</MenuItem>
        <MenuItem value="False">False</MenuItem>
      </TextField>
      {editedLeafType === LeafType.Quantity && (
        <TextField
          variant="standard"
          sx={{ width: "6ch" }}
          inputProps={{ sx: [{ pt: "2.5px", pb: "2.5px" }] }}
          value={unitInput}
          error={parseLeaf("0", unitInput, editedLeafType) === undefined}
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
        value={editedLeafType}
        focused={changedType}
        color={changedType ? "success" : undefined}
        onChange={({ target: { value } }) => {
          const newLeafType = value as unknown as LeafType;

          if (newLeafType === LeafType.Boolean) {
            setInput(input.toLowerCase() === "true" ? "True" : "False");
          }

          if (newLeafType === LeafType.Null) {
            setInput("None");
          }

          setEditedLeafType(newLeafType);
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
          setInput(originalInput);
          setUnitInput(originalUnitInput);
          setEditedLeafType(originalLeafType);
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
  /** Path to the data this item represents. */
  path: Path;
};

/** Item content for a Leaf. */
export default function LeafItemContent({ name, path }: LeafItemContentProps) {
  const [editMode] = useAtom(editModeAtom);

  return (
    <Box sx={leafItemContentSx}>
      <Typography>{name}</Typography>
      {editMode ? <LeafItemEditMode path={path} /> : <LeafItemReadMode path={path} />}
    </Box>
  );
}
