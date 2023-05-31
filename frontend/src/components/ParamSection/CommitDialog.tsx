import { detailedDiff } from "deep-object-diff";
import { useTransition } from "react";
import { atom, useAtom, useSetAtom } from "jotai";
import { Save } from "@mui/icons-material";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { requestData } from "@/utils/api";
import { originalDataAtom } from "@/atoms/api";
import {
  editModeAtom,
  editedDataAtom,
  commitDialogOpenAtom,
  commitMessageAtom,
} from "@/atoms/paramList";

/**
 * The commit ID from the most recent unhandled commit request, or null if there is no
 * such request. (When a request resolves, it will set this atom to the ID of the created
 * commit. Then once the request is handled, it sets this atom back to null.)
 */
const commitIdAtom = atom<Promise<number> | null>(null);

const dialogContentSx = {
  display: "flex",
  flexDirection: "column",
  rowGap: 2.5,
};

const dialogActionsSx = {
  pt: 0,
  pb: 2.5,
  px: 3,
  columnGap: 1.25,
};

const commitButtonSx = {
  ".MuiLoadingButton-loadingIndicatorStart": {
    left: "9px",
  },
};

/**
 * Dialog displaying changes to the data, a text field for entering the commit message,
 * a commit button, and a close button.
 */
export default function CommitDialog() {
  const [commitLoading, startCommitTransition] = useTransition();

  const [originalData] = useAtom(originalDataAtom);
  const [editedData] = useAtom(editedDataAtom);
  const [, setCommitId] = useAtom(commitIdAtom);
  const setEditMode = useSetAtom(editModeAtom);
  const [commitDialogOpen, setCommitDialogOpen] = useAtom(commitDialogOpenAtom);
  const [commitMessage, setCommitMessage] = useAtom(commitMessageAtom);

  const close = () => setCommitDialogOpen(commitLoading || false);
  const commit = () => {
    startCommitTransition(() => {
      setCommitId(
        requestData<number>("api/commit", { message: commitMessage, data: editedData }),
      );
      setCommitDialogOpen(false);
      setEditMode(false);
    });
  };

  /** Whether to disabled commit dialog inputs. */
  const disabled = commitLoading || !open;

  const changes = detailedDiff({ root: originalData }, { root: editedData });

  return (
    <Dialog fullWidth open={commitDialogOpen} onClose={close}>
      <form
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          commit();
        }}
      >
        <DialogTitle>Commit</DialogTitle>
        <DialogContent sx={dialogContentSx}>
          {/* <Box>
          <Typography>Added</Typography>
          <Typography data-testid="commit-dialog-added">
            {JSON.stringify(changes.added)}
          </Typography>
        </Box>
        <Box>
          <Typography>Deleted</Typography>
          <Typography data-testid="commit-dialog-deleted">
            {JSON.stringify(changes.deleted)}
          </Typography>
        </Box> */}
          <Box>
            <Typography>Changed</Typography>
            <Typography data-testid="commit-dialog-changed">
              {JSON.stringify(changes.updated)}
            </Typography>
          </Box>
          <TextField
            data-testid="commit-message-text-field"
            fullWidth
            label="Message"
            required
            disabled={disabled}
            value={commitMessage}
            onChange={({ target: { value } }) => setCommitMessage(value)}
          />
        </DialogContent>
        <DialogActions sx={dialogActionsSx}>
          <Button
            data-testid="close-commit-dialog-button"
            variant="outlined"
            disabled={disabled}
            onClick={close}
          >
            Close
          </Button>
          <LoadingButton
            data-testid="make-commit-button"
            variant="outlined"
            sx={commitButtonSx}
            type="submit"
            startIcon={<Save />}
            loadingPosition="start"
            loading={commitLoading}
            disabled={disabled}
          >
            Commit
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
