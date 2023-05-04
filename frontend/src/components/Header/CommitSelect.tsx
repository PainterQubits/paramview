import { startTransition, useState, useMemo, useCallback, Suspense } from "react";
import { useAtom } from "jotai";
import {
  PaperProps,
  PopperProps,
  autocompleteClasses,
  outlinedInputClasses,
  ThemeProvider,
  Box,
  Paper,
  Popper,
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

const popperSx = {
  [`& .${autocompleteClasses.listbox}`]: {
    p: 0,
    maxHeight: "none",
  },
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

/** Popper with additional styles. */
function StyledPopper(props: PopperProps) {
  return <Popper sx={popperSx} {...props} />;
}

/** Component to display when CommitSelect is done loading. */
function CommitSelectContents() {
  const [selectedCommitIndex, setSelectedCommitIndex] = useAtom(selectedCommitIndexAtom);
  const [syncLatest, setSyncLatest] = useAtom(syncLatestAtom);
  const [commitHistory] = useAtom(commitHistoryAtom);

  /** Index in the commit history of the currently highlighted commit. */
  const [highlightedCommitIndex, setHighlightedCommitIndex] = useState<number | null>(
    null,
  );

  /**
   * Indices of the commit history in reverse. Used as options for the Autocomplete
   * component.
   */
  const commitIndices = useMemo(
    () => [...commitHistory.keys()].reverse(),
    [commitHistory],
  );

  /** Get the primary text to show for a given index in the commit history. */
  const getPrimary = useCallback(
    (commitIndex: number) => {
      const commit = commitHistory[commitIndex];
      return `${commit.id}: ${commit.message}`;
    },
    [commitHistory],
  );

  /** Get the secondary text to show for a given index in the commit history. */
  const getSecondary = useCallback(
    (commitIndex: number) => formatDate(commitHistory[commitIndex].timestamp),
    [commitHistory],
  );

  /**
   * Index in the commit history of the commit to display the timestamp for and scroll to.
   */
  const displayCommitIndex = highlightedCommitIndex ?? selectedCommitIndex;

  /** Functions to pass to the CommitSelectList component via a context. */
  const commitSelectListContextValue = useMemo(() => {
    return {
      scrollToCommitIndex: displayCommitIndex,
      getId: (commitIndex: number) => commitHistory[commitIndex].id,
      getPrimary,
      getSecondary,
    };
  }, [displayCommitIndex, commitHistory, getPrimary, getSecondary]);

  return (
    <Box sx={commitSelectSx}>
      <CommitSelectListContext.Provider value={commitSelectListContextValue}>
        <Autocomplete
          data-testid="commit-select-combobox"
          sx={autocompleteSx}
          fullWidth
          disablePortal
          disableListWrap
          autoHighlight
          value={selectedCommitIndex}
          onChange={(_, commitIndex) => {
            if (commitIndex !== null) {
              startTransition(() => {
                setSyncLatest(false);
                setSelectedCommitIndex(commitIndex);
              });
            }
          }}
          onHighlightChange={(_, commitIndex) => setHighlightedCommitIndex(commitIndex)}
          onClose={() => startTransition(() => setHighlightedCommitIndex(null))}
          options={commitIndices}
          getOptionLabel={getPrimary}
          PaperComponent={LightModePaper}
          PopperComponent={StyledPopper}
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
                      {getSecondary(displayCommitIndex)}
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
            data-testid="latest-checkbox"
            control={<Checkbox color="secondary" checked={syncLatest} />}
            label="Latest"
            labelPlacement="start"
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
    <Suspense
      fallback={
        <Skeleton data-testid="commit-select-loading" variant="rounded" height="4rem" />
      }
    >
      <CommitSelectContents />
    </Suspense>
  );
}
