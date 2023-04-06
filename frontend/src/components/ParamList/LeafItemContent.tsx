import { Box, Typography } from "@mui/material";

const leafItemContentSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flex: 1,
  pl: "24px",
  pr: 2,
  py: 0.25,
  borderLeft: 1,
  borderColor: "divider",
  background: "white",
};

type LeafItemContentProps = {
  name: string;
  value: string;
};

export default function LeafItemContent({ name, value }: LeafItemContentProps) {
  return (
    <Box sx={leafItemContentSx}>
      <Typography>{name}</Typography>
      <Typography align="right">{value}</Typography>
    </Box>
  );
}
