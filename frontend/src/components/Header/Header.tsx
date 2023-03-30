import { ThemeProvider, Box, Typography, AppBar } from "@mui/material";
import { appTitle } from "@/constants";
import theme from "@/theme";

const toolbarSx = {
  display: "flex",
  px: 2,
  py: 1.5,
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
        </Box>
      </ThemeProvider>
    </AppBar>
  );
}
