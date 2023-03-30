import { ThemeProvider, Box, Typography, AppBar } from "@mui/material";
import { appTitle } from "@/constants";
import theme from "@/theme";
import CommitSelect from "./CommitSelect";

const toolbarSx = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  columnGap: 4,
  px: 2,
  py: 1.5,
};

const commitSelectContainerSx = {
  flex: 1,
  maxWidth: "50rem",
};

/** Header containing the app title. */
export default function Header() {
  return (
    <AppBar position="static" elevation={0}>
      <ThemeProvider theme={theme("dark")}>
        <Box sx={toolbarSx}>
          <Typography variant="h1" align="center">
            {appTitle}
          </Typography>
          <Box sx={commitSelectContainerSx}>
            <CommitSelect />
          </Box>
        </Box>
      </ThemeProvider>
    </AppBar>
  );
}
