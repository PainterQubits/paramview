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

const leftBorderSx = {
  borderLeft: 1,
  borderColor: "divider",
};

type ParamItemContentProps = {
  name: string;
  value: string;
  leftPadding?: boolean;
  leftBorder?: boolean;
};

export default function ParamItemContent({
  name,
  value,
  leftPadding = false,
  leftBorder = false,
}: ParamItemContentProps) {
  return (
    <Box
      sx={[
        itemContentSx,
        leftPadding ? leftPaddingSx : {},
        leftBorder ? leftBorderSx : {},
      ]}
    >
      <Typography>{name}</Typography>
      <Typography align="right">{value}</Typography>
    </Box>
  );
}
