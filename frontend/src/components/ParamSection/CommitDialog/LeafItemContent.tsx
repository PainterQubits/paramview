import { Box, Typography } from "@mui/material";
import { Leaf } from "@/types";
import { leafToString } from "@/utils/data";

const leafItemContentSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flex: 1,
  pl: "24px",
  pr: 2,
  minHeight: "28px",
};

type LeafItemContentProps = {
  name: string;
  leaf: Leaf;
};

export default function LeafItemContent({ name, leaf }: LeafItemContentProps) {
  return (
    <Box sx={leafItemContentSx}>
      <Typography>{name}</Typography>
      <Typography align="right">{leafToString(leaf, false)}</Typography>
    </Box>
  );
}
