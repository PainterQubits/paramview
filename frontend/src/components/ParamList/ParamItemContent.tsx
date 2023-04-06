import { Box, Typography } from "@mui/material";

const itemContentSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flex: 1,
  pr: 2,
  py: 0.2,
};

const leftPaddingSx = {
  pl: "24px",
};

type ParamItemContentProps = {
  name: string;
  value: string;
  leftPadding?: boolean;
};

export default function ParamItemContent({
  name,
  value,
  leftPadding = false,
}: ParamItemContentProps) {
  return (
    <Box sx={[itemContentSx, leftPadding ? leftPaddingSx : {}]}>
      <Typography>{name}</Typography>
      <Typography align="right">{value}</Typography>
    </Box>
  );
}
