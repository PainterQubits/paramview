import { Suspense } from "react";
import { useAtom } from "jotai";
import { ThemeProvider, Box, Typography, AppBar } from "@mui/material";
import theme from "@/theme";
import { databaseNameAtom } from "@/atoms/api";
import CommitSelect from "./CommitSelect";

const toolbarSx = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  columnGap: 4,
  px: 2,
  py: 1.5,
};

const databaseNameSx = {
  flexShrink: 1,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};

const commitSelectContainerSx = {
  flex: 1,
  maxWidth: "50rem",
};

function DatabaseName() {
  const [databaseName] = useAtom(databaseNameAtom);

  return (
    <Typography variant="h1" sx={databaseNameSx}>
      {databaseName}
    </Typography>
  );
}

/** Header containing the app title. */
export default function Header() {
  return (
    <AppBar position="static" elevation={0}>
      <ThemeProvider theme={theme("dark")}>
        <Box sx={toolbarSx}>
          <Suspense fallback={<Box />}>
            <DatabaseName />
          </Suspense>
          <Box sx={commitSelectContainerSx}>
            <CommitSelect />
          </Box>
        </Box>
      </ThemeProvider>
    </AppBar>
  );
}
