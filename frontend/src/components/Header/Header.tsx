import { Box, Typography, AppBar } from "@mui/material";
import { appTitle } from "@/constants";

const toolbarSx = {
  display: "flex",
  px: 2,
  py: 1.5,
};

/** Header containing the app title. */
export default function Header() {
  return (
    <AppBar position="static" elevation={0}>
      <Box sx={toolbarSx}>
        <Typography variant="h1" align="center">
          {appTitle}
        </Typography>
      </Box>
    </AppBar>
  );
}
