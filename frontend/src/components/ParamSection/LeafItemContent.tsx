import { useState, useEffect, useMemo, useCallback } from "react";
import { useAtom } from "jotai";
import { Replay } from "@mui/icons-material";
import { Box, Typography, TextField, MenuItem, IconButton } from "@mui/material";
import { Path, LeafType, Leaf } from "@/types";
import {
  leafToString,
  getLeafType,
  leafToInput,
  parseLeaf,
  getData,
  setData,
} from "@/utils/data";
import { isLeaf } from "@/utils/type";
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

type LeafItemReadModeContentProps = {
  /** Leaf value to display. */
  leaf: Leaf;
};

/** Displays the string value of the given leaf. */
function LeafItemReadModeContent({ leaf }: LeafItemReadModeContentProps) {
  const [round] = useAtom(roundAtom);

  return <Typography align="right">{leafToString(leaf, round)}</Typography>;
}

type LeafItemEditModeContentProps = {
  /** Edited leaf value that is used as the initial value. */
  editedLeaf: Leaf;
  /** Path to the data this item represents. */
  path: Path;
};

/** Input fields for entering a new leaf value. */
function LeafItemEditModeContent({ editedLeaf, path }: LeafItemEditModeContentProps) {
  const [originalRootData] = useAtom(originalDataAtom);
  const [editedRootData, setEditedRootData] = useAtom(editedDataAtom);

  const originalLeaf = useMemo(() => {
    const originalData = getData(originalRootData, path);

    if (!isLeaf(originalData)) {
      throw new TypeError("original data for leaf input is not a leaf");
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

  const [inputFocused, setInputFocused] = useState(false);
  const [unitInputFocused, setUnitInputFocused] = useState(false);
  const [leafTypeFocused, setLeafTypeFocused] = useState(false);

  const [leafType, setLeafType] = useState(editedLeafType);
  const [input, setInput] = useState(editedInput);
  const [unitInput, setUnitInput] = useState(editedUnitInput);

  const setEditedData = useCallback(
    (leaf: Leaf) => {
      if (path.length === 0) {
        setEditedRootData(leaf);
      } else {
        setData(editedRootData, path, leaf);
      }
    },
    [editedRootData, path, setEditedRootData],
  );

  const changedInput = input !== originalInput;
  const changedUnitInput = unitInput !== originalUnitInput;
  const changedLeafType = leafType !== originalLeafType;
  const changed = changedInput || changedUnitInput || changedLeafType;

  useEffect(() => {
    const parsedLeaf = parseLeaf(leafType, input, unitInput);

    // Edited data is only updated if it is valid and has actually been changed. The
    // changed check is needed to avoid asking the user to confirm they want to discard
    // changes when they haven't input anything.
    //
    // For example, parseLeaf can use a different timezone for the ISO string than the
    // backend. If this check wasn't there, edited and original data would register as
    // being not deeply equal even though they refer to the same underlying values.
    setEditedData(parsedLeaf !== undefined && changed ? parsedLeaf : originalLeaf);
  }, [leafType, input, unitInput, originalLeaf, changed, setEditedData]);

  return (
    <Box sx={{ display: "flex", columnGap: 1 }}>
      <TextField
        data-testid="leaf-input"
        variant="standard"
        sx={{
          ml: 1,
          width: "min-content",
          minWidth: leafType === LeafType.Quantity ? "calc(14rem - 8px - 6ch)" : "14rem",
        }}
        inputProps={{ sx: [{ pt: "2.5px", pb: "2.5px" }], step: 1 }}
        select={leafType === LeafType.Boolean}
        disabled={leafType === LeafType.Null}
        type={leafType === LeafType.Datetime ? "datetime-local" : undefined}
        value={input}
        error={parseLeaf(leafType, input, "u") === undefined}
        focused={changedInput || inputFocused}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        color={changedInput ? "success" : undefined}
        onChange={({ target: { value } }) => setInput(value)}
      >
        <MenuItem data-testid="boolean-input-option-True" value="True">
          True
        </MenuItem>
        <MenuItem data-testid="boolean-input-option-False" value="False">
          False
        </MenuItem>
      </TextField>
      {leafType === LeafType.Quantity && (
        <TextField
          data-testid="leaf-unit-input"
          variant="standard"
          sx={{ width: "6ch" }}
          inputProps={{ sx: [{ pt: "2.5px", pb: "2.5px" }] }}
          value={unitInput}
          error={parseLeaf(leafType, "0", unitInput) === undefined}
          focused={changedUnitInput || unitInputFocused}
          onFocus={() => setUnitInputFocused(true)}
          onBlur={() => setUnitInputFocused(false)}
          color={changedUnitInput ? "success" : undefined}
          onChange={({ target: { value } }) => setUnitInput(value)}
        />
      )}
      <TextField
        data-testid="leaf-type-input"
        select
        variant="standard"
        sx={{ width: "90px" }}
        inputProps={{ sx: [{ pt: "2.5px", pb: "2.5px" }] }}
        value={leafType}
        focused={changedLeafType || leafTypeFocused}
        onFocus={() => setLeafTypeFocused(true)}
        onBlur={() => setLeafTypeFocused(false)}
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
        <MenuItem data-testid="leaf-type-option-int-float" value={LeafType.Number}>
          int/float
        </MenuItem>
        <MenuItem data-testid="leaf-type-option-bool" value={LeafType.Boolean}>
          bool
        </MenuItem>
        <MenuItem data-testid="leaf-type-option-str" value={LeafType.String}>
          str
        </MenuItem>
        <MenuItem data-testid="leaf-type-option-None" value={LeafType.Null}>
          None
        </MenuItem>
        <MenuItem data-testid="leaf-type-option-Quantity" value={LeafType.Quantity}>
          Quantity
        </MenuItem>
        <MenuItem data-testid="leaf-type-option-datetime" value={LeafType.Datetime}>
          datetime
        </MenuItem>
      </TextField>
      <IconButton
        data-testid="reset-leaf-button"
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
        <LeafItemEditModeContent editedLeaf={leaf} path={path} />
      ) : (
        <LeafItemReadModeContent leaf={leaf} />
      )}
    </Box>
  );
}
