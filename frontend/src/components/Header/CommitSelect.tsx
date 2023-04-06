import { startTransition, useState, useMemo, useCallback, Suspense } from "react";
import { useAtom } from "jotai";
import {
  PaperProps,
  autocompleteClasses,
  outlinedInputClasses,
  ThemeProvider,
  Box,
  Paper,
  Typography,
  Autocomplete,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Skeleton,
} from "@mui/material";
import theme from "@/theme";
import { formatDate } from "@/utils/timestamp";
import { commitHistoryAtom } from "@/atoms/api";
import { syncLatestAtom, selectedCommitIndexAtom } from "@/atoms/commitSelect";
import CommitSelectList, { CommitSelectListContext } from "./CommitSelectList";

const commitSelectSx = {
  display: "flex",
  alignItems: "center",
};

const autocompleteSx = {
  [`& .${outlinedInputClasses.root} .${autocompleteClasses.input}`]: {
    pt: 0.25,
    pb: 0,
    pl: 0.5,
  },
};

const inputSx = {
  backgroundColor: "rgba(255, 255, 255, 0.1)",
};

const timestampSx = {
  pl: 0.5,
  pb: 0.125,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  flexBasis: "100%",
};

/**
 * Material UI Paper component in light mode. This is necessary since the rest of the
 * header is in dark mode.
 */
function LightModePaper(props: PaperProps) {
  return (
    <ThemeProvider theme={theme("light")}>
      <Paper {...props} />
    </ThemeProvider>
  );
}

/** Component to display when CommitSelect is done loading. */
function CommitSelectContents() {
  const [selectedCommitIndex, setSelectedCommitIndex] = useAtom(selectedCommitIndexAtom);
  const [syncLatest, setSyncLatest] = useAtom(syncLatestAtom);

  /** Commit history entries retrieved from the server. */
  const [commitHistory] = useAtom(commitHistoryAtom);

  /** Index of the currently highlighted item in the commit list dropdown. */
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  /** History indices in reverse. (Used as options for the autocomplete component.) */
  const historyIndices = useMemo(
    () => [...commitHistory.keys()].reverse(),
    [commitHistory],
  );

  /** Get the commit message for the given history index. */
  const getMessage = useCallback(
    (index: number) => `${commitHistory[index].id}: ${commitHistory[index].message}`,
    [commitHistory],
  );

  /** Index of the history entry to display the timestamp for. */
  const displayIndex = highlightedIndex === null ? selectedCommitIndex : highlightedIndex;

  /** Functions to pass to the CommitSelectList component via a context. */
  const commitSelectListContextValue = useMemo(
    () => ({
      scrollToIndex: selectedCommitIndex,
      getPrimary: getMessage,
      getSecondary: (option: number) => formatDate(commitHistory[option].timestamp),
    }),
    [getMessage, commitHistory, selectedCommitIndex],
  );

  return (
    <Box sx={commitSelectSx}>
      <CommitSelectListContext.Provider value={commitSelectListContextValue}>
        <Autocomplete
          sx={autocompleteSx}
          fullWidth
          disablePortal
          disableListWrap
          autoHighlight
          value={selectedCommitIndex}
          onChange={(_, index) => {
            if (index !== null) {
              startTransition(() => {
                setSyncLatest(false);
                setSelectedCommitIndex(index);
              });
            }
          }}
          onHighlightChange={(_, index) => {
            if (index !== null) {
              startTransition(() => setHighlightedIndex(index));
            }
          }}
          onClose={() => startTransition(() => setHighlightedIndex(null))}
          options={historyIndices}
          getOptionLabel={getMessage}
          PaperComponent={LightModePaper}
          ListboxComponent={CommitSelectList}
          renderOption={(props, option) => [props, option] as React.ReactNode}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Commit"
              color="secondary"
              InputProps={{
                ...params.InputProps,
                sx: inputSx,
                endAdornment: (
                  <>
                    {params.InputProps.endAdornment}
                    <Typography variant="body2" color="text.secondary" sx={timestampSx}>
                      {formatDate(commitHistory[displayIndex].timestamp)}
                    </Typography>
                  </>
                ),
              }}
            />
          )}
        />
      </CommitSelectListContext.Provider>
      <Box>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox color="secondary" />}
            label="Latest"
            labelPlacement="start"
            checked={syncLatest}
            onChange={() =>
              startTransition(() => {
                setSyncLatest(!syncLatest);
                setSelectedCommitIndex(commitHistory.length - 1);
              })
            }
          />
        </FormGroup>
      </Box>
    </Box>
  );
}

/** Controls that affect the entire dashboard. */
export default function CommitSelect() {
  return (
    <Suspense fallback={<Skeleton variant="rounded" height="4rem" />}>
      <CommitSelectContents />
    </Suspense>
  );
}
