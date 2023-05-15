import { startTransition, useState, useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import { Replay } from "@mui/icons-material";
import { Box, Typography, TextField, MenuItem, IconButton } from "@mui/material";
import { Path, LeafType, Leaf } from "@/types";
import { leafToString, inputToLeaf, getTypeString, getData, setData } from "@/utils/data";
import { dataAtom } from "@/atoms/api";
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

type LeafItemContentReadModeProps = {
  /** Path to the data this item represents. */
  path: Path;
};

function LeafItemContentReadMode({ path }: LeafItemContentReadModeProps) {
  const [rootData] = useAtom(dataAtom);
  const [round] = useAtom(roundAtom);
  const leafValue = useMemo(() => getData(rootData, path) as Leaf, [rootData, path]);

  return <Typography align="right">{leafToString(leafValue, round)}</Typography>;
}

type LeafItemContentEditModeProps = {
  /** Path to the data this item represents. */
  path: Path;
};

function LeafItemContentEditMode({ path }: LeafItemContentEditModeProps) {
  const [originalRootData] = useAtom(dataAtom);
  const [editedRootData] = useAtom(editedDataAtom);
  const originalLeafValue = useMemo(
    () => getData(originalRootData, path) as Leaf,
    [originalRootData, path],
  );
  const editedLeafValue = useMemo(
    () => getData(editedRootData, path) as Leaf,
    [editedRootData, path],
  );

  const [input, setInput] = useState(() => leafToString(editedLeafValue, false));

  return (
    <Box sx={{ display: "flex", columnGap: 1 }}>
      <TextField
        variant="standard"
        inputProps={{ sx: [{ pt: "2.5px", pb: "2.5px", textAlign: "right" }] }}
        value={input}
        error={inputToLeaf(input) === undefined}
        // focused={editMode || changed}
        // color={changed ? "success" : undefined}
        // error={!validInput}
        // onChange={(event) => {
        //   const newInput = event.target.value;
        //   const parsedLeaf = inputToLeaf(newInput);
        //   const newValidInput = parsedLeaf !== undefined;
        //   if (newValidInput) {
        //     setData(editedRootData, path, parsedLeaf);
        //   }
        //   setInput(newInput);
        //   setValidInput(newValidInput);
        //   setChanged(parsedLeaf !== originalDataValue);
        // }}
        onChange={({ target: { value: newInput } }) => {
          setInput(newInput);
        }}
      />
      <TextField
        select
        variant="standard"
        sx={{ width: "90px" }}
        inputProps={{ sx: [{ pt: "2.5px", pb: "2.5px" }] }}
        value={getType(editedLeafValue)}
      >
        <MenuItem value={LeafType.Number}>int/float</MenuItem>
        <MenuItem value={LeafType.Boolean}>bool</MenuItem>
        <MenuItem value={LeafType.String}>str</MenuItem>
        <MenuItem value={LeafType.Null}>None</MenuItem>
        <MenuItem value={LeafType.Quantity}>Quantity</MenuItem>
        <MenuItem value={LeafType.Datetime}>datetime</MenuItem>
      </TextField>
    </Box>
  );

  // const [editMode, setEditMode] = useState(false);
  // const [validInput, setValidInput] = useState(true);
  // const [changed, setChanged] = useState(false);
  // const [editedLeafValue, setEditedLeafValue] = useState<Leaf>(
  //   () => getData(editedRootData, path) as Leaf,
  // );
  // const [input, setInput] = useState(() => leafToString(editedLeafValue, false));
  // const [reset, setReset] = useState(Symbol());

  // const originalDataValue = useMemo(
  //   () => getData(originalRootData, path),
  //   [originalRootData, path],
  // );

  // useEffect(() => {
  //   const newEditedLeafValue = getData(editedRootData, path) as Leaf;
  //   setEditedLeafValue(newEditedLeafValue);
  //   setInput(leafToString(newEditedLeafValue, false));
  //   setValidInput(true);
  //   setChanged(newEditedLeafValue !== originalDataValue);
  // }, [editedRootData, path, originalDataValue, editMode, reset, setInput]);

  // return (
  //   <Box sx={{ display: "flex", columnGap: 1 }}>
  //     <TextField
  //       variant="standard"
  //       inputProps={{ sx: [{ pt: "2px", pb: "3px", textAlign: "right" }] }}
  //       value={input}
  //       focused={editMode || changed}
  //       color={changed ? "success" : undefined}
  //       error={!validInput}
  //       onFocus={() => setEditMode(true)}
  //       onBlur={() => startTransition(() => setEditMode(false))}
  //       onChange={(event) => {
  //         const newInput = event.target.value;
  //         const parsedLeaf = inputToLeaf(newInput);
  //         const newValidInput = parsedLeaf !== undefined;
  //         if (newValidInput) {
  //           setData(editedRootData, path, parsedLeaf);
  //         }
  //         setInput(newInput);
  //         setValidInput(newValidInput);
  //         setChanged(parsedLeaf !== originalDataValue);
  //       }}
  //     />
  //     <TextField
  //       select
  //       variant="standard"
  //       sx={{ width: "90px" }}
  //       inputProps={{ sx: [{ pt: "2px", pb: "3px" }] }}
  //       value={getType(editedLeafValue)}
  //     >
  //       <MenuItem value="int/float">int/float</MenuItem>
  //       <MenuItem value="bool">bool</MenuItem>
  //       <MenuItem value="str">str</MenuItem>
  //       <MenuItem value="None">None</MenuItem>
  //       <MenuItem value="Quantity">Quantity</MenuItem>
  //       <MenuItem value="datetime">datetime</MenuItem>
  //     </TextField>
  //     <IconButton
  //       sx={{ width: "1.75rem", height: "1.75rem" }}
  //       size="small"
  //       // onClick={() => {
  //       //   setData(editedRootData, path, originalDataValue);
  //       //   setReset(Symbol());
  //       // }}
  //     >
  //       <Replay fontSize="small" />
  //     </IconButton>
  //   </Box>
  // );
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
      {editMode ? (
        <LeafItemContentEditMode path={path} />
      ) : (
        <LeafItemContentReadMode path={path} />
      )}
    </Box>
  );
}
