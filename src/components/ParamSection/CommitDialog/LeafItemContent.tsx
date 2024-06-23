import { Typography } from "@mui/material";
import { Leaf } from "@/types";
import { leafToString } from "@/utils/data";
import ItemContent from "../ItemContent";

const leafItemContentSx = {
  pl: "24px",
};

type LeafItemContentProps = {
  /** Name to display. */
  name: string;
  /** Class name to display, if any. */
  className: string | null;
  /** Timestamp to display, if any. */
  timestamp: string | null;
  /** Leaf value to display. */
  leaf: Leaf;
  /** Background color (any valid color CSS). */
  backgroundColor: string;
};

/** Item content for a leaf in the ComparisonList component. */
export default function LeafItemContent({
  name,
  className,
  timestamp,
  leaf,
  backgroundColor,
}: LeafItemContentProps) {
  return (
    <ItemContent
      name={name}
      className={className}
      timestamp={timestamp}
      extraSx={{ ...leafItemContentSx, backgroundColor }}
    >
      <Typography align="right">{leafToString(leaf, false)}</Typography>
    </ItemContent>
  );
}
