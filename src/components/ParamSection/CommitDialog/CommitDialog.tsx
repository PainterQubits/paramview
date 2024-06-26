import { useTransition } from "react";
import { atom, useAtom, useSetAtom } from "jotai";
import { Save } from "@mui/icons-material";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { requestData } from "@/utils/api";
import {
  editModeAtom,
  commitDialogOpenAtom,
  commitMessageAtom,
  commitDataAtom,
} from "@/atoms/paramList";
import ComparisonList from "./ComparisonList";

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

  const [commitDialogOpen, setCommitDialogOpen] = useAtom(commitDialogOpenAtom);
  const [commitMessage, setCommitMessage] = useAtom(commitMessageAtom);
  const [commitData] = useAtom(commitDataAtom);

  // We load this using useAtom, not useSetAtom, so this component updates when
  // setCommitId is called.
  const [, setCommitId] = useAtom(commitIdAtom);

  const setEditMode = useSetAtom(editModeAtom);

  const close = () => setCommitDialogOpen(commitLoading || false);
  const commit = () => {
    startCommitTransition(() => {
      setCommitId(
        requestData<number>("api/commit", {
          message: commitMessage,
          data: JSON.stringify(commitData),
        }),
      );
      setCommitDialogOpen(false);
      setEditMode(false);
    });
  };

  /** Whether to disabled commit dialog inputs. */
  const disabled = commitLoading || !commitDialogOpen;

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
          <ComparisonList />
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
