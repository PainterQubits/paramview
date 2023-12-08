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
  /** Name to display. */
  name: string;
  /** Leaf value to display. */
  leaf: Leaf;
  /** Background color (any valid color CSS). */
  backgroundColor: string;
};

/** Item content for a leaf in the ComparisonList component. */
export default function LeafItemContent({
  name,
  leaf,
  backgroundColor,
}: LeafItemContentProps) {
  return (
    <Box sx={{ ...leafItemContentSx, backgroundColor }}>
      <Typography>{name}</Typography>
      <Typography align="right">{leafToString(leaf, false)}</Typography>
    </Box>
  );
}
