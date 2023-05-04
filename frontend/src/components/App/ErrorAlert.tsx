import { FallbackProps } from "react-error-boundary";
import { alertClasses, Box, Alert, AlertTitle, Typography, Button } from "@mui/material";
import { Refresh } from "@mui/icons-material";

const errorAlertSx = {
  m: 2,
  [`.${alertClasses.message}`]: {
    overflow: "visible",
  },
};

const errorMesssageSx = {
  my: 2,
  whiteSpace: "pre-wrap",
};

/** Displays the given error and a button to reload the page. */
export default function ErrorAlert({ error }: FallbackProps) {
  document.title = "Error";

  return (
    <Alert severity="error" sx={errorAlertSx}>
      <AlertTitle data-testid="alert-title">Error</AlertTitle>
      <Box component="pre" sx={errorMesssageSx}>
        <Typography data-testid="error-message">{error.message}</Typography>
      </Box>
      <Button
        data-testid="reload-button"
        variant="contained"
        endIcon={<Refresh />}
        onClick={() => window.location.reload()}
      >
        Reload
      </Button>
    </Alert>
  );
}
