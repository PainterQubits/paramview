import { useState, useEffect, useMemo, useCallback } from "react";
import { useAtom } from "jotai";
import { Replay } from "@mui/icons-material";
import { Box, Typography, TextField, MenuItem, IconButton } from "@mui/material";
import { Path, LeafType, DataType, Leaf } from "@/types";
import {
  leafToString,
  getLeafType,
  leafToInput,
  parseLeaf,
  isLeaf,
  unwrapParamData,
  getData,
  setData,
  updateLastUpdated,
} from "@/utils/data";
import { nowTimestamp } from "@/utils/timestamp";
import { originalDataAtom } from "@/atoms/api";
import { roundAtom, editModeAtom, editedDataAtom } from "@/atoms/paramList";
import ItemContent from "./ItemContent";

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

  const { originalLastUpdated, originalLeaf } = useMemo(() => {
    const originalData = getData(originalRootData, path);
    const { innerData: originalInnerData } = unwrapParamData(originalData);

    if (!isLeaf(originalInnerData)) {
      throw new TypeError("original data for leaf input is not a leaf");
    }

    const lastUpdated =
      typeof originalData === "object" &&
      originalData !== null &&
      originalData.type === DataType.ParamData
        ? originalData.lastUpdated
        : null;

    return { originalLastUpdated: lastUpdated, originalLeaf: originalInnerData };
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

  const changedInput = input !== originalInput;
  const changedUnitInput = unitInput !== originalUnitInput;
  const changedLeafType = leafType !== originalLeafType;
  const changed = changedInput || changedUnitInput || changedLeafType;

  const setEditedData = useCallback(
    ({ leaf, lastUpdated }: { leaf: Leaf; lastUpdated: number | null }) => {
      // Update the corresponding leaf in the edited data object.
      if (path.length === 0) {
        setEditedRootData(leaf);
      } else {
        setData(editedRootData, path, {
          type: "set",
          value: leaf,
          withinParamData: true,
        });
      }

      if (lastUpdated !== null) {
        updateLastUpdated(editedRootData, path, lastUpdated);
      }
    },
    [editedRootData, path, setEditedRootData],
  );

  useEffect(() => {
    const parsedLeaf = parseLeaf(leafType, input, unitInput);

    // Edited data is only updated if it is valid and has actually been changed. The
    // changed check is needed to only update the last updated timestamp if a change has
    // been made.
    setEditedData(
      parsedLeaf !== undefined && changed
        ? { leaf: parsedLeaf, lastUpdated: nowTimestamp() }
        : { leaf: originalLeaf, lastUpdated: originalLastUpdated },
    );
  }, [
    leafType,
    input,
    unitInput,
    changed,
    originalLeaf,
    originalLastUpdated,
    setEditedData,
  ]);

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
        <MenuItem data-testid="bool-input-option-True" value="True">
          True
        </MenuItem>
        <MenuItem data-testid="bool-input-option-False" value="False">
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

const leafItemContentSx = {
  pl: "24px",
  background: "white",
};

type LeafItemContentProps = {
  /** Name to display. */
  name: string;
  /** Class name to display, if any. */
  className: string | null;
  /** Timestamp to display, if any. */
  timestamp: string | null;
  /** Leaf value to display, or the edited leaf value in edit mode. */
  leaf: Leaf;
  /** Path to the data this item represents. */
  path: Path;
};

/** Item content for a Leaf. */
export default function LeafItemContent({
  name,
  className,
  timestamp,
  leaf,
  path,
}: LeafItemContentProps) {
  const [editMode] = useAtom(editModeAtom);

  return (
    <ItemContent
      name={name}
      className={className}
      timestamp={timestamp}
      extraSx={leafItemContentSx}
    >
      {editMode ? (
        <LeafItemEditModeContent editedLeaf={leaf} path={path} />
      ) : (
        <LeafItemReadModeContent leaf={leaf} />
      )}
    </ItemContent>
  );
}
