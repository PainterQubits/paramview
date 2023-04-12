import { Box, Paper, Typography } from "@mui/material";
import ParamControls from "./ParamControls";
import ParamList from "./ParamList";

const paramSectionSx = {
  display: "flex",
  flexDirection: "column",
  flexBasis: "40rem",
  overflow: "hidden",
  borderLeft: 1,
  borderRight: 1,
  borderColor: "divider",
};

const paramHeaderSx = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  columnGap: 2,
  rowGap: 1,
  px: 2,
  py: 1.5,
  backgroundColor: "primary.100",
  zIndex: 1,
};

/** Parameter section of the app. */
export default function ParamSection() {
  return (
    <Box sx={paramSectionSx}>
      <Paper square elevation={2} sx={paramHeaderSx}>
        <Typography variant="h2">Parameters</Typography>
        <ParamControls />
      </Paper>
      <ParamList />
    </Box>
  );
}
