import { useAtom } from "jotai";
import { Box, Typography } from "@mui/material";
import { Leaf } from "@/types";
import { leafToString } from "@/utils/data";
import { roundAtom } from "@/atoms/paramList";

const leafItemContentSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flex: 1,
  pl: "24px",
  pr: 2,
  py: 0.25,
  background: "white",
};

type LeafItemContentProps = {
  name: string;
  value: Leaf;
};

export default function LeafItemContent({ name, value }: LeafItemContentProps) {
  const [round] = useAtom(roundAtom);

  return (
    <Box sx={leafItemContentSx}>
      <Typography>{name}</Typography>
      <Typography align="right">{leafToString(value, round)}</Typography>
    </Box>
  );
}
