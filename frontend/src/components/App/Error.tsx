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

/** Displayed in case of any uncaught error within the app. */
export default function Error({ error }: FallbackProps) {
  return (
    <Alert severity="error" sx={errorAlertSx}>
      <AlertTitle>Error</AlertTitle>
      <Box component="pre" sx={errorMesssageSx}>
        <Typography>{error.message}</Typography>
      </Box>
      <Button
        variant="contained"
        endIcon={<Refresh />}
        onClick={() => window.location.reload()}
      >
        Reload
      </Button>
    </Alert>
  );
}
