import { detailedDiff } from "deep-object-diff";
import { useState, useTransition } from "react";
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
import { editModeAtom, editedDataAtom } from "@/atoms/paramList";

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

  const [commitDialogOpen, setCommitDialogOpen] = useState(false);
  const [message, setMessage] = useState("");

  const open = () => {
    setMessage("");
    setCommitDialogOpen(true);
  };
  const close = () => setCommitDialogOpen(commitLoading || false);
  const commit = () =>
    startCommitTransition(() => {
      setCommitId(requestData<number>("api/commit", { message, data: editedData }));
      setCommitDialogOpen(false);
      setEditMode(false);
    });

  const changes = detailedDiff({ root: originalData }, { root: editedData });

  return (
    <>
      <Button
        data-testid="open-commit-dialog-button"
        key="commit"
        variant="contained"
        onClick={open}
      >
        Commit
      </Button>
      <Dialog fullWidth open={commitDialogOpen} onClose={close}>
        <DialogTitle>Commit</DialogTitle>
        <DialogContent sx={dialogContentSx}>
          <Box>
            <Typography>Added</Typography>
            <Typography>{JSON.stringify(changes.added)}</Typography>
          </Box>
          <Box>
            <Typography>Deleted</Typography>
            <Typography>{JSON.stringify(changes.deleted)}</Typography>
          </Box>
          <Box>
            <Typography>Changed</Typography>
            <Typography>{JSON.stringify(changes.updated)}</Typography>
          </Box>
          <TextField
            data-testid="commit-message-text-field"
            fullWidth
            label="Message"
            disabled={commitLoading}
            value={message}
            onChange={({ target: { value } }) => setMessage(value)}
          />
        </DialogContent>
        <DialogActions sx={dialogActionsSx}>
          <Button
            data-testid="close-commit-dialog-button"
            variant="outlined"
            disabled={commitLoading || !open}
            onClick={close}
          >
            Close
          </Button>
          <LoadingButton
            data-testid="make-commit-button"
            variant="outlined"
            sx={commitButtonSx}
            startIcon={<Save />}
            loadingPosition="start"
            loading={commitLoading}
            disabled={commitLoading || !open}
            onClick={commit}
          >
            Commit
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
