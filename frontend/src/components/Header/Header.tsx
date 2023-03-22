import { Box, Typography, AppBar } from "@mui/material";
import { appTitle } from "@/constants";

const toolbarSx = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  columnGap: 4,
  px: 2,
  py: 1.5,
};

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
