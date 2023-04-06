import { Box, Typography } from "@mui/material";
import { formatDate } from "@/utils/timestamp";

const itemContentSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flex: 1,
  pr: 2,
  py: 0.25,
};

const nameContainerSx = {
  display: "flex",
  alignItems: "baseline",
  columnGap: 1.25,
};

const timestampSx = {
  whiteSpace: "nowrap",
};

type ParamItemContentProps = {
  name: string;
  type: string;
  timestamp: number;
};

export default function ParamItemContent({
  name,
  type,
  timestamp,
}: ParamItemContentProps) {
  return (
    <Box sx={itemContentSx}>
      <Box sx={nameContainerSx}>
        <Typography>{name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {type}
        </Typography>
      </Box>
      {Number.isFinite(timestamp) && (
        <Typography variant="body2" color="text.secondary" align="right" sx={timestampSx}>
          {formatDate(timestamp)}
        </Typography>
      )}
    </Box>
  );
}
