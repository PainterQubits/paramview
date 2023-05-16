import { detailedDiff } from "deep-object-diff";
import { useAtom } from "jotai";
import {
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { originalDataAtom } from "@/atoms/api";
import { editedDataAtom, commitDialogOpenAtom } from "@/atoms/paramList";

const dialogContentSx = {
  display: "flex",
  flexDirection: "column",
  rowGap: 2.5,
};

export default function CommitDialog() {
  const [originalData] = useAtom(originalDataAtom);
  const [editedData] = useAtom(editedDataAtom);
  const [commitDialogOpen, setCommitDialogOpen] = useAtom(commitDialogOpenAtom);

  const close = () => setCommitDialogOpen(false);

  const changes = detailedDiff({ root: originalData }, { root: editedData });

  return (
    <Dialog fullWidth open={commitDialogOpen} onClose={close}>
      <DialogTitle>Commit</DialogTitle>
      <DialogContent sx={dialogContentSx}>
        <Typography>{JSON.stringify(changes)}</Typography>
        <TextField fullWidth label="Message" />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Close</Button>
        <Button>Commit</Button>
      </DialogActions>
    </Dialog>
  );
}