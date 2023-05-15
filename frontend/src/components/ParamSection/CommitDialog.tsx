import { useAtom } from "jotai";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { editedDataAtom, commitDialogOpenAtom } from "@/atoms/paramList";

export default function CommitDialog() {
  const [editedData] = useAtom(editedDataAtom);
  const [commitDialogOpen, setCommitDialogOpen] = useAtom(commitDialogOpenAtom);

  const close = () => setCommitDialogOpen(false);

  return (
    <Dialog fullWidth open={commitDialogOpen} onClose={close}>
      <DialogTitle>Commit</DialogTitle>
      <DialogContent>
        <DialogContentText>{JSON.stringify(editedData)}</DialogContentText>
        <TextField variant="standard" fullWidth label="Message" />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Close</Button>
        <Button>Commit</Button>
      </DialogActions>
    </Dialog>
  );
}
