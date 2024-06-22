import { Box, Typography } from "@mui/material";

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
  /** Name to display. */
  name: string;
  /** Class name to display, if any. */
  className: string | null;
  /** Timestamp to display. */
  timestamp: string | null;
};

/** Item content for a Group. */
export default function GroupItemContent({
  name,
  className,
  timestamp,
}: ParamItemContentProps) {
  return (
    <Box sx={itemContentSx}>
      <Box sx={nameContainerSx}>
        <Typography>{name}</Typography>
        {className !== null && (
          <Typography variant="body2" color="text.secondary">
            {className}
          </Typography>
        )}
      </Box>
      {timestamp !== null && (
        <Typography variant="body2" color="text.secondary" align="right" sx={timestampSx}>
          {timestamp}
        </Typography>
      )}
    </Box>
  );
}
